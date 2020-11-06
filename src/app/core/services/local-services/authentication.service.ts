import {
  Injectable, Inject, EventEmitter, NgZone,
} from '@angular/core';
import {
  Observable, interval, Subscription, BehaviorSubject,
} from 'rxjs';
import { AuthorityTemplateNames } from 'src/app/core/services';
import { SessionLoginInput, SessionProfile, SessionsService } from '..';
import { StorageService } from './storage.service';

// eslint-disable-next-line no-shadow
export enum AuthRequestType {
  LOGIN = 1,
  LOGOUT = 2,
}

export interface AuthObservableData {
  data?: any;
  isSuccessfull: boolean;
  message?: string;
  requestType: AuthRequestType;
  errorType?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private static sessionKey = 'session';

  public loginChanged = new EventEmitter<string>();

  private session: SessionProfile;

  private passwordChangeRequired: boolean;

  private pollIntervalSource: Observable<number>;

  private subscription: Subscription;

  private sessionPollInterval = 10000;

  private loginStateSource = new BehaviorSubject<boolean>(false);

  private loginStateObservable = this.loginStateSource.asObservable();

  constructor(
    @Inject(StorageService)
    private store: StorageService,
    private sessionService: SessionsService,
    private ngZone: NgZone,
  ) {
    this.loadSession();
  }

  /**
   * Loads the local session from storage.
   *
   * If available, it starts a new session.
   */
  loadSession() {
    const session = this.store.get(AuthenticationService.sessionKey);
    this.session = session || {};
    if (this.session.sid) {
      this.startSession(this.session);
    }
  }

  /**
   * Login user.
   */
  login(data: SessionLoginInput): Observable<AuthObservableData> {
    return new Observable((observer) => {
      this.sessionService.login(data).subscribe(
        (response) => {
          this.startSession(response);
          observer.next({
            isSuccessfull: true,
            message: 'Login success',
            requestType: AuthRequestType.LOGIN,
          });
          this.passwordChangeRequired = response.isRequiredToChangePassword;
        },
        (error) => {
          observer.error({
            isSuccessfull: false,
            message: 'Login Failed',
            requestType: AuthRequestType.LOGIN,
            errorType: error.error.errorType,
          });
        },
        () => {
          this.loginChanged.emit(this.getUserName());
        },
      );
    });
  }

  /**
   * Checks if user is logged in a the moment.
   */
  isLoggedIn(): boolean {
    return this.loginStateSource.value;
  }

  /**
   * Checks if the user is required to change the login password.
   */
  isPasswordChangeRequired(): boolean {
    return this.passwordChangeRequired;
  }

  getLoggedInObservable(): Observable<boolean> {
    return this.loginStateObservable;
  }

  /**
   * Get access token for logged in user. Returns undefined if not found.
   */
  getToken(): string {
    return this.session.accessToken;
  }

  /**
   * Get session id.
   */
  getSessionId(): string {
    return this.session.sid;
  }

  /**
   * Get userID.
   */
  getUserName(): string {
    return this.session.name;
  }

  /**
   * Get authorityTemplateName (role) of the current user.
   *
   * @param useSingularRole In some places a singular version of the role names is used.
   */
  getRole(useSingularRole = false): string {
    let result: string = this.session.authorityTemplateName;
    if (useSingularRole) {
      const accessRoleNames = {
        [AuthorityTemplateNames.SUPERVISORS]: 'supervisor',
        [AuthorityTemplateNames.ADMINISTRATORS]: 'admin',
        [AuthorityTemplateNames.USERS]: 'user',
        [AuthorityTemplateNames.GUESTS]: 'guest',
      };

      result = accessRoleNames[result] || 'unknown';
    }

    return result;
  }

  /**
   * End remote and local sessions.
   */
  logout(): Observable<AuthObservableData> {
    return new Observable((observer) => {
      if (this.session.sid) {
        this.sessionService.logout(this.session.sid, 'response').subscribe(
          (response) => {
            this.endSession();
            observer.next({
              isSuccessfull: true,
              requestType: AuthRequestType.LOGOUT,
            });
          },
          (error) => {
            observer.next({
              isSuccessfull: false,
              message: 'Error connecting to server',
              requestType: AuthRequestType.LOGOUT,
              data: error,
            });
          },
          () => {
            this.loginChanged.emit('');
          },
        );
      } else {
        this.endSession();
        observer.next({
          isSuccessfull: true,
          requestType: AuthRequestType.LOGOUT,
        });
      }
    });
  }

  /**
   * Logout user locally.
   */
  endSession() {
    this.store.remove(AuthenticationService.sessionKey);
    this.loginStateSource.next(false);
    this.session = {};
    if (this.subscription) this.subscription.unsubscribe();
    this.pollIntervalSource = null;
    this.loginStateSource.next(false);
  }

  /**
   * Starts a local session.
   */
  private startSession(sessionData: SessionProfile) {
    this.store.set(AuthenticationService.sessionKey, sessionData);
    this.session = sessionData;
    this.loginStateSource.next(true);

    this.pollIntervalSource = interval(this.sessionPollInterval);
    // Polling has to be done outside the angular zone to make the e2e tests work.
    this.ngZone.runOutsideAngular(() => {
      this.subscription = this.pollIntervalSource.subscribe((x) => {
        // Return to angular zone.
        this.ngZone.run(() => {
          this.pollSessionStatus();
        });
      });
    });
  }

  parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      // '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      const x = c.charCodeAt(0).toString(16);
      return `%00${x.slice(-2)}`;
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  private pollSessionStatus() {
    this.sessionService.getSession(this.session.sid, /* do not reset session timeout */ false)
      .subscribe(
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        (response) => { /* do nothing */ },
        (error) => {
          if (error.status === 401) {
            this.endSession();
          }
        },
      );
  }
}
