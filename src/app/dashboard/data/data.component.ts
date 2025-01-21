import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { StoreService } from '../../shared/store.service';
import { BackendService } from '../../shared/backend.service';
import { FormsModule } from '@angular/forms';
import { Course } from '../../shared/Interfaces/Course';

@Component({
  selector: 'app-data',
  standalone: true,
  imports: [SharedModule, FormsModule],
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css'],
})
export class DataComponent {
  public filter = {
    courseName: '',
    instructorName: '',
    date: '',
  };


  public sortKey: keyof Course | undefined;
  public sortOrder: 'asc' | 'desc' = 'asc';

  public filteredCourses: Course[] = [];

  public page: number = 1; 
  public totalPages: number = 0; 

  public registrationSortKey: string = 'registrationDate';
  public registrationSortOrder: 'asc' | 'desc' = 'asc'; 

  constructor(public storeService: StoreService, private backendService: BackendService) {}

  ngOnInit() {
   
    this.filteredCourses = [...this.storeService.courses];

    this.loadRegistrations(this.page);

    this.applyRegistrationSorting();
  }

  applyFilters() {
    this.filteredCourses = this.storeService.courses.filter((course) => {
      const matchesCourseName = this.filter.courseName
        ? course.name.toLowerCase().includes(this.filter.courseName.toLowerCase())
        : true;

      const matchesInstructorName = this.filter.instructorName
        ? course.instructor.toLowerCase().includes(this.filter.instructorName.toLowerCase())
        : true;

      const matchesDate = this.filter.date
        ? course.dates.some(
            (date) => new Date(date.begin).toDateString() === new Date(this.filter.date).toDateString()
          )
        : true;

      return matchesCourseName && matchesInstructorName && matchesDate;
    });

    this.applySorting(); 
  }

  applySorting() {
    if (this.sortKey) {
      this.filteredCourses.sort((a, b) => {
        let valA: any;
        let valB: any;

        if (this.sortKey === 'dates') {
          valA = a.dates[0]?.begin || '';
          valB = b.dates[0]?.begin || '';
        } else {
          valA = a[this.sortKey!];
          valB = b[this.sortKey!];
        }

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return this.sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
  }


  changeSorting(key: keyof Course) {
    if (this.sortKey === key) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortOrder = 'asc';
    }

    this.applySorting();
  }


  loadRegistrations(page: number) {
 
  this.backendService.getRegistrations(page);
  this.totalPages = Math.ceil(this.storeService.registrationTotalCount / 3); 
}

  selectPage(page: number) {
    this.page = page; 
    this.loadRegistrations(page); 
  }


  returnAllPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  public loadingStates: boolean[] = [];

  cancelRegistration(registrationId: string, index: number) {
    if (confirm('Möchten Sie die Anmeldung wirklich stornieren?')) {
      this.loadingStates[index] = true; 
      const idAsNumber = parseInt(registrationId, 10); 
  
      this.backendService.deleteRegistration(idAsNumber, this.page).subscribe({
        next: () => {
          setTimeout(() => {
           
            this.loadingStates[index] = false;
            this.loadRegistrations(this.page); 
          }, 4000); 
        },
        error: () => {
          
          setTimeout(() => {
            this.loadingStates[index] = false;
            alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
          }, 4000);
        },
      });
    }
  }

  applyRegistrationSorting() {
    this.storeService.registrations.sort((a, b) => {
      const dateA = new Date(a.registrationDate).getTime();
      const dateB = new Date(b.registrationDate).getTime();
      return this.registrationSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }

  changeRegistrationSorting() {
    this.registrationSortOrder = this.registrationSortOrder === 'asc' ? 'desc' : 'asc';
    this.applyRegistrationSorting();
  }
  
  
}
