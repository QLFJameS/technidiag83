import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';  // Import HttpClient

@Component({
  selector: 'app-devis',
  templateUrl: './devis.component.html',
  imports: [CommonModule, TitleCasePipe, ReactiveFormsModule],
  styleUrls: ['./devis.component.css']
})
export class DevisComponent implements OnInit {

  devisForm!: FormGroup;
  confirmationMessage: string = '';  // Variable pour stocker le message de confirmation
  isSubmitting = false;  // Variable d'état
  loading = false;  // Variable d'état
  diagnostics = ['dpe', 'amiante', 'plomb', 'gaz', 'electricite', 'termites', 'erp', 'boutin', 'carrez'];

  constructor(private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit(): void {
    this.devisForm = this.fb.group({
      genre: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      bien: ['', Validators.required],
      address: ['', Validators.required],
      transaction: ['', Validators.required],
      diagnostics: this.fb.array([])
    });
  }

  validateForm(): boolean {
    for (const field in this.devisForm.controls) {
      if (this.devisForm.controls.hasOwnProperty(field)) {
        const control = this.devisForm.get(field);
        control?.markAsTouched({ onlySelf: true });
      }
    }
    return this.devisForm.valid;
  }

  onCheckboxChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const diagnosticsArray = this.devisForm.get('diagnostics') as FormArray;
  
    if (checkbox.checked) {
      diagnosticsArray.push(this.fb.control(checkbox.value));
    } else {
      const index = diagnosticsArray.controls.findIndex(x => x.value === checkbox.value);
      diagnosticsArray.removeAt(index);
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    if (this.validateForm()) {
      this.loading = true;  // Active le spinner
      this.isSubmitting = true;  // Désactive le bouton
      const url = 'http://vps.technidiag83.fr:3000/send-devis';

      setTimeout(() => {
        this.http.post(url, this.devisForm.value).subscribe({
          next: (data) => {
            console.log('Réponse du serveur:', data);
            this.showConfirmationMessage('Votre devis a été envoyé avec succès.');
            this.isSubmitting = false;
            this.loading = false;  // Désactive le spinner
          },
          error: (error) => {
            console.error('Erreur lors de l\'envoi du devis:', error);
            this.showConfirmationMessage(`Une erreur est survenue: ${error.message || 'Veuillez réessayer.'}`);
            this.isSubmitting = false;
            this.loading = false;  // Désactive le spinner
          }
        });
      }, 2000); // Simulate a 2-second server response time
    } else {
      console.error('Le formulaire est invalide');
      this.showConfirmationMessage('Veuillez remplir tous les champs obligatoires.');
    }
  }

  showConfirmationMessage(message: string) {
    this.confirmationMessage = message;
    console.log('Confirmation message:', this.confirmationMessage);  // Ajoutez ceci pour déboguer
  }
}