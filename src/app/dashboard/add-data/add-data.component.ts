import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { StoreService } from '../../shared/store.service';
import { BackendService } from '../../shared/backend.service';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; 
import { MatDatepickerInput } from '@angular/material/datepicker';
import { MatDatepickerToggle } from '@angular/material/datepicker';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { SharedModule } from '../../shared/shared.module';
import { MatOption } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-add-data',
  standalone: true,
  imports: [
    MatCheckboxModule,
    SharedModule,
    MatOption,
    MatFormField,
    MatInputModule,
    MatSelect,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDatepickerInput,
    MatDatepickerToggle
  ],
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.css']
})
export class AddDataComponent implements OnInit {
  public registrationForm: any;
  isModalVisible: boolean = false;

  constructor(
    private formbuilder: FormBuilder, 
    public storeService: StoreService, 
    private backendService: BackendService
  ) { }

  ngOnInit(): void {
    
    this.registrationForm = this.formbuilder.group({
      name: ['', [Validators.required]],
      courseId: ['', Validators.required],
      birthdate: [null, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      newsletter: [false]
    });
  
    this.backendService.getCourses();
  }

    errorMessage: string | null = null;

    onSubmit() {
      if (this.registrationForm.valid) {
        const { name, email, courseId, birthdate } = this.registrationForm.value;
    
        this.backendService.checkDuplicateRegistration(name, email, courseId).subscribe(
          (isDuplicate) => {
            if (isDuplicate) {
              this.errorMessage = 'Sie sind bereits für diesen Kurs angemeldet.';
            } else {
              this.registrationForm.patchValue({ birthdate: (birthdate as Date).toISOString().split("T")[0] });
  
              this.backendService.addRegistration(this.registrationForm.value, this.storeService.currentPage);
    
              this.errorMessage = null;
              this.registrationForm.reset();
              this.isModalVisible = true;
            }
          },
          (error) => {
            console.error('Fehler bei der Duplikatsprüfung:', error);
            this.errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
          }
        );
      }
    }
    

  closeModal(){
    this.isModalVisible = false;
  }
}
