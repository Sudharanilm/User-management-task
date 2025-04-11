import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatPaginatorModule} from '@angular/material/paginator';


const LOCAL_STORAGE_KEY = 'userList';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule,MatIconModule,MatInputModule,MatSelectModule,MatFormFieldModule,MatPaginatorModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent {
  users: User[] = [];
  showCreateForm = false;
  newUser: User = { name: '', email: '', role: '' };

  // Pagination state
  currentPage = 1;
  usersPerPage = 10;

  constructor() {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      this.users = JSON.parse(stored);
    } else {
      this.users = [
        { name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
        { name: 'Bob Smith', email: 'bob@example.com', role: 'User' },
        // Add more sample users here if needed
      ];
      this.saveToStorage();
    }
  }

  saveToStorage(): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.users));
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }

formSubmitted = false;


createUser(form: any): void {
  this.formSubmitted = true;

  if (form.valid) {
    this.users.push({ ...this.newUser });
    this.saveToStorage();
    this.newUser = { name: '', email: '', role: '' };
    form.resetForm();
    this.showCreateForm = false;
    this.formSubmitted = false; // reset after successful submission
    this.goToLastPage();
  }
}
  

  // Edit modal
  isEditModalOpen = false;
  editUserData: User = { name: '', email: '', role: '' };
  editIndex: number = -1;

  openEditModal(index: number): void {
    const globalIndex = this.filteredUsers.indexOf(this.paginatedUsers[index]);
    this.editIndex = globalIndex;
    this.editUserData = { ...this.users[this.editIndex] };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
  }

  editSubmitted = false;

  saveEdit(): void {
    this.editSubmitted = true;
  
    const isValid =
      this.editUserData.name?.trim() &&
      this.editUserData.email?.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.editUserData.email) &&
      this.editUserData.role?.trim();
  
    if (isValid && this.editIndex !== -1) {
      this.users[this.editIndex] = { ...this.editUserData };
      this.saveToStorage();
      this.closeEditModal();
      this.editSubmitted = false; // Reset after successful save
    }
  }

  isEmailInvalid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(email);
  }
  

  confirmDelete(index: number): void {
    const globalIndex = this.filteredUsers.indexOf(this.paginatedUsers[index]);
    const confirmDelete = confirm(`Are you sure? Do you want delete: ${this.users[globalIndex].name}?`);
    if (confirmDelete) {
      this.users.splice(globalIndex, 1);
      this.saveToStorage();
      this.adjustPageAfterDelete();
    }
  }

  sortColumn: keyof User | null = null;
  sortDirection: 'asc' | 'desc' | '' = '';

  toggleSort(column: keyof User): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : this.sortDirection === 'desc' ? '' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  get sortedUsers(): User[] {
    if (!this.sortColumn || !this.sortDirection) return this.users;
    const column = this.sortColumn;
    return [...this.users].sort((a, b) => {
      const valueA = a[column].toLowerCase();
      const valueB = b[column].toLowerCase();
      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  searchTerm: string = '';

  get filteredUsers(): User[] {
    const term = this.searchTerm.toLowerCase();
    return this.sortedUsers.filter(user =>
      user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.usersPerPage);
  }

  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.usersPerPage;
    return this.filteredUsers.slice(start, start + this.usersPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  goToLastPage(): void {
    this.currentPage = this.totalPages;
  }

  adjustPageAfterDelete(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
  }
}

type User = {
  name: string;
  email: string;
  role: string;
};
