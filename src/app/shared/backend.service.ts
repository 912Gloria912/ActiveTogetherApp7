import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StoreService } from './store.service';
import { Course } from './Interfaces/Course';
import { Registration } from './Interfaces/Registration';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http: HttpClient, private storeService: StoreService) { }

  public getCourses() {
    this.http.get<Course[]>('http://localhost:5000/courses?_expand=eventLocation').subscribe(data => {
      this.storeService.courses = data;
    });
  }

  public getRegistrations(page: number) {

    const options = {
      observe: 'response' as const,
      transferCache: {
        includeHeaders: ['X-Total-Count']
      }
    };

    this.http.get<Registration[]>(`http://localhost:5000/registrations?_expand=course&_page=${page}&_limit=3`, options).subscribe(data => {
      this.storeService.registrations = data.body!;
      this.storeService.registrationTotalCount = Number(data.headers.get('X-Total-Count'));
    });
  }

  public addRegistration(registration: any, page: number) {
    // Füge das aktuelle Datum als Anmeldedatum hinzu
    registration.registrationDate = new Date().toISOString();
  
    this.http.post('http://localhost:5000/registrations', registration).subscribe(() => {
      this.getRegistrations(page); // Registrierungen neu laden
    });
  }
  
  public deleteRegistration(registrationId: number, page: number) {
    return this.http.delete(`http://localhost:5000/registrations/${registrationId}`);
  }

  public checkDuplicateRegistration(name: string, email: string, courseId: string) {
    return this.http.get<Registration[]>('http://localhost:5000/registrations').pipe(
      map((registrations: Registration[]) => {
        console.log('Alle Registrierungen:', registrations);
        const isDuplicate = registrations.some(
          (registration: Registration) =>
            registration.name.trim().toLowerCase() === name.trim().toLowerCase() && // String-Vergleich für Name
            registration.email.trim().toLowerCase() === email.trim().toLowerCase() && // String-Vergleich für E-Mail
            registration.courseId.toString() === courseId // Direkter String-Vergleich für courseId
        );
        console.log('Duplikat gefunden:', isDuplicate);
        return isDuplicate;
      })
    );
  }
  
}
