import { MapsAPILoader, AgmCoreModule } from '@agm/core';
import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'go-around';
  zoom: number = 8;
  address: string = '';
  changeAddress: string = '';
  latitude: number = 13.746345642630601;
  longitude: number = 100.56279136117175;
  private geoCoder: any;
  public origin: any;
  public destination: any;

  @ViewChild('search')
  public searchRef!: ElementRef;

  constructor(private mapsAPILoader: MapsAPILoader, private ngZone: NgZone) {}

  ngOnInit() {
    this.getDirection();
    this.mapsAPILoader.load().then(() => {
      this.setCurrentLocation();
      this.geoCoder = new google.maps.Geocoder();
      let autocomplete = new google.maps.places.Autocomplete(
        this.searchRef.nativeElement
      );
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 10;
          let changeAddress = place.formatted_address;
          console.log('Change address: ', changeAddress);
          this.getChangeAddress(place.formatted_address!);
        });
        this.getDestination();
      });
    });
  }

  getChangeAddress(changeAddress: string) {
    this.changeAddress = changeAddress;
  }

  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
        this.getAddress(this.latitude, this.longitude);
        console.log(
          'Your location = \n',
          `lat: ${position.coords.latitude}, lng: ${position.coords.longitude}`
        );
        this.getDirection();
      });
    }
  }

  getAddress(latitude: number, longitude: number) {
    this.geoCoder.geocode(
      { location: { lat: latitude, lng: longitude } },
      (results: any, status: any) => {
        if (status === 'OK') {
          if (results[0]) {
            this.zoom = 12;
            this.address = results[0].formatted_address;
          } else {
            window.alert('Not found');
          }
        }
        console.log('Youe location is: ', this.address);
      }
    );
  }

  public waypoints: any = [];
  public renderOptions = {
    suppressMarkers: true,
    draggable: true,
  };
  public markerOptions = {
    origin: {
      draggable: true,
      icon: '../assets/images/platoo-icon.png',
    },
    destination: {
      draggable: true,
    },
  };

  public change($event: any) {
    this.waypoints = $event.request.waypoints;
  }

  getDirection() {
    this.origin = { lat: this.latitude, lng: this.longitude };
    this.destination = { lat: 13.746345642630601, lng: 100.56279136117175 };
    console.log('ori: ', this.origin);
    console.log('des: ', this.destination);
  }

  getDestination() {
    this.destination = { lat: this.latitude, lng: this.longitude };
    console.log('destination check: ', this.destination);
  }

  mapClicked($event: google.maps.MouseEvent) {
    console.log('Now we go: ', this.latitude, this.longitude);
  }
}
