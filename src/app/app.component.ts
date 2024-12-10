import { Component } from '@angular/core';
import { ImageCroppedEvent, ImageTransform, LoadedImage } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'my-angular-app';
  transform: ImageTransform = {
    scale: 1,
    rotate: 0,
    flipH: false,
    flipV: false,
  };
  imageChangedEvent: any = '';
    croppedImage: SafeUrl = '';

    constructor(
      private sanitizer: DomSanitizer
    ) {
    }
  

    fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
    }
    imageCropped(event: ImageCroppedEvent) {
      this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.base64 || '');
    }
    imageLoaded(image: LoadedImage) {
        // show cropper
    }
    cropperReady() {
        // cropper ready
    }
    loadImageFailed() {
        // show message
    }
}
