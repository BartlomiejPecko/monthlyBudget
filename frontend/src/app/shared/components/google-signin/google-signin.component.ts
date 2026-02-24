import {
  Component, AfterViewInit, ElementRef, ViewChild,
  Output, EventEmitter, NgZone, OnDestroy
} from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-google-signin',
  standalone: true,
  template: `<div #googleBtn class="google-btn-wrapper"></div>`,
  styles: [`
    .google-btn-wrapper {
      display: flex;
      justify-content: center;
      width: 100%;
    }
  `]
})
export class GoogleSigninComponent implements AfterViewInit, OnDestroy {
  @ViewChild('googleBtn') googleBtn!: ElementRef;
  @Output() credentialReceived = new EventEmitter<string>();

  private callbackName = `googleCallback_${Date.now()}`;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    // Wait for Google script to load
    this.waitForGoogle().then(() => {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response) => {
          // Google callback runs outside Angular zone
          this.ngZone.run(() => {
            this.credentialReceived.emit(response.credential);
          });
        }
      });

      google.accounts.id.renderButton(this.googleBtn.nativeElement, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: 320
      });
    });
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private waitForGoogle(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof google !== 'undefined' && google.accounts) {
        resolve();
        return;
      }
      const interval = setInterval(() => {
        if (typeof google !== 'undefined' && google.accounts) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }
}