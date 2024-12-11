import {
  ChangeDetectionStrategy,
  Component,
  SecurityContext,
  ViewChild,
} from '@angular/core';
import { ThemeVariables, ThemeRef, lyl, StyleRenderer } from '@alyle/ui';
import { Platform } from '@angular/cdk/platform';
import {
  STYLES as CROPPER_STYLES,
  ImgCropperConfig,
  ImgCropperErrorEvent,
  ImgCropperEvent,
  ImgCropperLoaderConfig,
  LyImageCropper,
} from '@alyle/ui/image-cropper';
import { LySliderChange } from '@alyle/ui/slider';
import { DomSanitizer } from '@angular/platform-browser';
import { compressAccurately, EImageType } from 'image-conversion';

const STYLES = (theme: ThemeVariables, ref: ThemeRef) => {
  ref.renderStyleSheet(CROPPER_STYLES);
  const cropper = ref.selectorsOf(CROPPER_STYLES);
  return {
    root: lyl`{
      ${cropper.root} {
        max-width: 400px
        height: 300px
      }
    }`,
    sliderContainer: lyl`{
      text-align: center
      max-width: 400px
      margin: 14px
    }`,
    cropResult: lyl`{
      border-radius: 50%
    }`,
  };
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StyleRenderer],
})
export class AppComponent {
  classes = this.sRenderer.renderSheet(STYLES, 'root');
  croppedImage?: any;
  scale: number;
  ready: boolean;
  minScale: number;

  @ViewChild(LyImageCropper, { static: true }) readonly cropper: LyImageCropper;
  myConfig: ImgCropperConfig = {
    width: 150, // Default `250`
    height: 150, // Default `200`
    fill: '#ff2997', // Default transparent if type = png else #000
    type: 'image/jpeg', // Or you can also use `image/jpeg`
    round: true,
    keepAspectRatio: true,
    responsiveArea: true,
    antiAliased: false,
  };

  imageChangedEvent: any = '';

  constructor(
    readonly sRenderer: StyleRenderer,
    private _platform: Platform,
    private sanitizer: DomSanitizer
  ) {}
  ngAfterViewInit() {
    // demo: Load image from URL and update position, scale, rotate
    // this is supported only for browsers
    if (this._platform.isBrowser) {
      const config: ImgCropperLoaderConfig = {
        scale: 0.745864772531767,
        xOrigin: 642.380608078103,
        yOrigin: 236.26357452128866,
        // rotation: 90,
        originalDataURL:
          'https://firebasestorage.googleapis.com/v0/b/alyle-ui.appspot.com/o/img%2Flarm-rmah-47685-unsplash-1.png?alt=media&token=96a29be5-e3ef-4f71-8437-76ac8013372c',
      };
      this.cropper.loadImage(config);
    }
  }

  onCropped(e: ImgCropperEvent) {
    this.croppedImage = e.dataURL;
    console.log('cropped img: ', e);
  }
  onLoaded(e: ImgCropperEvent) {
    console.log('img loaded', e);
  }
  onError(e: ImgCropperErrorEvent) {
    console.warn(`'${e.name}' is not a valid image`, e);
  }
  onSliderInput(event: LySliderChange) {
    this.scale = event.value as number;
  }

  async imageChange(event: any) {
    const file = event.target.files[0];
    this.imageChangedEvent = event;
    compressAccurately(file, {
      size: 100, //The compressed image size is 100kb
      accuracy: 0.9, //the accuracy of image compression size,range 0.8-0.99,default 0.95;
      //this means if the picture size is set to 1000Kb and the
      //accuracy is 0.9, the image with the compression result
      //of 900Kb-1100Kb is considered acceptable;
      type: EImageType.JPEG,
      width: 300,
      height: 200,
      orientation: 2,
      scale: 0.5,
    }).then(async (res) => {
      const base64: any = await this.blobToBase64(res);
      console.log(base64);
      if (base64) {
        const url = this.sanitizer.sanitize(
          SecurityContext.RESOURCE_URL,
          this.sanitizer.bypassSecurityTrustResourceUrl(base64)
        );
        this.cropper.loadImage({
          originalDataURL: url,
          width: 480,
          height: 480,
        });
      }
    });
  }

  imageLoaded(image: any) {
    console.log(image);
    // show cropper
    const url = this.sanitizer.sanitize(
      SecurityContext.RESOURCE_URL,
      this.sanitizer.bypassSecurityTrustResourceUrl(image.transformed.base64)
    );
    this.croppedImage = url;
    this.cropper.loadImage({
      originalDataURL: url,
      width: 480,
      height: 480,
    });
    var div = document.getElementById('avatarImage');
    div.appendChild(image.transformed.image);
    console.log(image.transformed.image);
  }
  cropperReady(e) {
    // cropper ready
  }

  imageCropped(e) {
    console.log(e);
  }

  blobToBase64(blob) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }
}
