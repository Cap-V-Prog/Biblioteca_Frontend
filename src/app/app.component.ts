import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { Observable } from 'rxjs';
interface Row {
  id: string;
  title: string;
  author: string;
  genre: string;
  status: string;
  editMode: boolean;
}

interface URow {
  id: string;
  name: string;
  email: string;
  editMode: boolean;
}

interface RRow {
  oid:string;
  uid: string;
  livro: string;
  Data: string;
  editMode: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  ngOnInit() {
    this.fetchRowData();
    this.UfetchRowData();
    this.RfetchRowData();
  }
  constructor(private http: HttpClient) { }
  APIUrl = "https://functionipt2.azurewebsites.net/api/";
  activeTab = 'books';
  showAddRow = false;

  //Search
  searchId: string = '';
  searchTitle: string = '';
  searchAuthor: string = '';
  searchGenre: string = '';
  searchStatus: string = '';

  RowData: Row = {
    id: '',
    title: '',
    author: '',
    genre: '',
    status: '',
    editMode: false
  };

  CopyRowData: Row = {
    id: '',
    title: '',
    author: '',
    genre: '',
    status: '',
    editMode: false
  };

  rows: Row[] = [];
  originalRows: Row[] = [];

  fetchRowData() {
    this.getAllLivros().subscribe(
      (data: any[]) => {
        console.log('Books data from the server:', data);
        this.originalRows = data.map((item: any) => ({
          id: item.id,
          title: item.titulo,
          author: item.autor,
          genre: item.genero,
          status: item.estado,
          editMode: false
        }));

        this.resetFilter();
      },
      (error) => {
        console.error(error);
      }
    );
  }

  resetFilter() {
    this.rows = [...this.originalRows];
    this.applyFilter();
  }

  showAddRowForm() {
    this.showAddRow = true;
  }

  cancelAddRow() {
    this.showAddRow = false;
    this.RowData = {
      id: '',
      title: '',
      author: '',
      genre: '',
      status: '',
      editMode: false
    };
  }

  toggleEditMode(row: Row) {
    if (row.editMode) {
      this.saveRow(row);
    } else {
      row.editMode = true;
    }
  }

  toggleDeleteMode(row: any) {
    if (row.editMode) {
      // Cancel the edit mode
      this.cancelEdit(row);
    } else {
      // Perform delete action
      this.deleteRow(row);
    }
  }

  deleteRow(row: Row) {
    const index = this.rows.indexOf(row);

    if (index !== -1) {
      const livroId = row.id;
      this.deleteLivro(livroId).subscribe(
        (response) => {
          console.warn(response);
          this.rows.splice(index, 1);
        },
        (error) => {
          console.warn(error);
          this.rows.splice(index, 1);
        }
      );
    }
  }

  cancelEdit(row: Row) {
    row.editMode = false;
    this.CopyRowData = {
      id: '',
      title: '',
      author: '',
      genre: '',
      status: '',
      editMode: false
    };
  }

  addRow() {
    const url = this.APIUrl+'InserirLivrosFunction';

    if (
      this.RowData.title.trim() !== '' &&
      this.RowData.author.trim() !== '' &&
      this.RowData.genre.trim() !== '' &&
      this.RowData.status.trim() !== ''
    ) {
      const payload = {
        id: uuidv4(),
        titulo: this.RowData.title,
        autor: this.RowData.author,
        genero: this.RowData.genre,
        estado: this.RowData.status,
      };

      this.rows.push({
        id: payload.id,
        title: this.RowData.title,
        author: this.RowData.author,
        genre: this.RowData.genre,
        status: this.RowData.status,
        editMode: false
      });

      return this.http.post(url, payload).subscribe(
        (response) => {
          // Handle the response here
          console.log(response);
          // Reset the form or any necessary variables
          this.cancelAddRow();
        },
        (error) => {
          // Handle any errors that occur during the request
          console.warn(error);
          this.cancelAddRow();
        }
      );
    }else{
      this.cancelAddRow();
      return ;
    }
  }

  getAllLivros() {
    const url = this.APIUrl+'ObterTodosLivrosFunction';
    return this.http.get<any[]>(url);
  }

  deleteLivro(livroId: string) {
    const url = this.APIUrl+`/livros/${livroId}`;
    return this.http.delete(url);
  }

  saveRow(row: Row): void {
    if (this.CopyRowData.title !== undefined && this.CopyRowData.title.trim() !== '') {
      row.title = this.CopyRowData.title;
    }
    if (this.CopyRowData.author !== undefined && this.CopyRowData.author.trim() !== '') {
      row.author = this.CopyRowData.author;
    }
    if (this.CopyRowData.genre !== undefined && this.CopyRowData.genre.trim() !== '') {
      row.genre = this.CopyRowData.genre;
    }
    if (this.CopyRowData.status !== undefined && this.CopyRowData.status.trim() !== '') {
      row.status = this.CopyRowData.status;
    }

    this.updateLivro(row);
    this.cancelEdit(row);
  }

  updateLivro(row: Row) {
    const url = this.APIUrl+`AtualizarLivrosFunction`;
    const payload = {
      id: row.id,
      titulo: row.title,
      autor: row.author,
      genero: row.genre,
      estado: row.status
    };

    this.http.put(url, payload).subscribe(
      () => {
        console.log('Livro updated successfully');
        // Handle any further actions after successful update
      },
      (error) => {
        console.error('Failed to update livro:', error);
        // Handle error cases
      }
    );
  }

  applyFilter() {
    if (
      this.searchId === '' &&
      this.searchTitle === '' &&
      this.searchAuthor === '' &&
      this.searchGenre === '' &&
      this.searchStatus === ''
    ) {
      this.rows = [...this.originalRows];
    } else {
      this.rows = this.originalRows.filter((row: Row) =>
        row.id.includes(this.searchId) &&
        row.title.toLowerCase().includes(this.searchTitle.toLowerCase()) &&
        row.author.toLowerCase().includes(this.searchAuthor.toLowerCase()) &&
        row.genre.toLowerCase().includes(this.searchGenre.toLowerCase()) &&
        (this.searchStatus === '' || row.status === this.searchStatus)
      );
    }
  }

  //!=============================!
  // HERE STARTS THE USER HANDLING
  //!=============================!

  //Search
  UsearchId: string = '';
  UsearchName: string = '';
  UsearchEmail: string = '';

  URowData: URow = {
    id: '',
    name: '',
    email: '',
    editMode: false
  };

  UCopyRowData: URow = {
    id: '',
    name: '',
    email: '',
    editMode: false
  };

  urows: URow[] = [];
  uoriginalRows: URow[] = [];

  UfetchRowData() {
    this.getAllUsers().subscribe(
      (data: any[]) => {
        console.log('User data from the server:', data);
        this.uoriginalRows = data.map((item: any) => ({
          id: item.id,
          name: item.nome,
          email: item.email,
          editMode: false
        }));

        this.UresetFilter();
      },
      (error) => {
        console.error(error);
      }
    );
  }
  getAllUsers() {
    const url = this.APIUrl+'ObterTodososUtilizadoresFunction';
    return this.http.get<any[]>(url);
  }

  UapplyFilter() {
    if (
      this.UsearchId === '' &&
      this.UsearchName === '' &&
      this.UsearchEmail === ''
    ) {
      this.urows = [...this.uoriginalRows];
    } else {
      this.urows = this.uoriginalRows.filter((row: URow) =>
        row.id.includes(this.UsearchId) &&
        row.name.toLowerCase().includes(this.UsearchName.toLowerCase()) &&
        row.email.toLowerCase().includes(this.UsearchEmail.toLowerCase())
      );
    }
  }

  UresetFilter() {
    this.urows = [...this.uoriginalRows];
    this.UapplyFilter();
  }

  UtoggleEditMode(row: URow) {
    if (row.editMode) {
      this.UsaveRow(row);
    } else {
      row.editMode = true;
    }
  }

  UaddRow() {
    const url = this.APIUrl+'InserirUtilizadoresFunction';

    if (
      this.URowData.name.trim() !== '' &&
      this.URowData.email.trim() !== ''
    ) {
      const payload = {
        id: uuidv4(),
        nome: this.URowData.name,
        email: this.URowData.email
      };

      this.urows.push({
        id: payload.id,
        name: this.URowData.name,
        email: this.URowData.email,
        editMode: false
      });
      return this.http.post(url, payload).subscribe(
        (response) => {
          // Handle the response here
          console.log(response);
          // Reset the form or any necessary variables
          this.UcancelAddRow();
        },
        (error) => {
          // Handle any errors that occur during the request
          console.warn(error);
          this.UcancelAddRow();
        }
      );
    }else{
      this.UcancelAddRow();
      return ;
    }
  }

  UcancelAddRow() {
    this.showAddRow = false;
    this.URowData = {
      id: '',
      name: '',
      email: '',
      editMode: false
    };
  }

  UsaveRow(row: URow): void {
    if (this.UCopyRowData.name !== undefined && this.UCopyRowData.name.trim() !== '') {
      row.name = this.UCopyRowData.name;
    }
    if (this.UCopyRowData.email !== undefined && this.UCopyRowData.email.trim() !== '') {
      row.email = this.UCopyRowData.email;
    }

    this.updateUser(row);
    this.UcancelEdit(row);
  }

  updateUser(row: URow) {
    const url = this.APIUrl+`AtualizarUtilizadoresFunction`;
    const payload = {
      id: row.id,
      nome: row.name,
      email: row.email
    };

    this.http.put(url, payload).subscribe(
      () => {
        console.log('User updated successfully');
        // Handle any further actions after successful update
      },
      (error) => {
        console.warn( error);
        // Handle error cases
      }
    );
  }

  UcancelEdit(row: URow) {
    row.editMode = false;
    this.UCopyRowData = {
      id: '',
      name: '',
      email: '',
      editMode: false
    };
  }

  UdeleteRow(row: URow) {
    const index = this.urows.indexOf(row);

    if (index !== -1) {
      const Id = row.id;
      this.deleteUser(Id).subscribe(
        (response) => {
          console.warn(response);
          this.urows.splice(index, 1);
        },
        (error) => {
          console.warn(error);
          this.urows.splice(index, 1);
        }
      );

    }
  }

  deleteUser(Id: string) {
    const url = this.APIUrl+`/Utilizadores/${Id}`;
    return this.http.delete(url);
  }

  UtoggleDeleteMode(row: any) {
    if (row.editMode) {
      // Cancel the edit mode
      this.UcancelEdit(row);
    } else {
      // Perform delete action
      this.UdeleteRow(row);
    }
  }

  //!=============================!
  // HERE STARTS THE Reserves HANDLING
  //!=============================!

  //Search
  RsearchOId: string = '';
  RsearchId: string = '';
  RsearchLivro: string = '';
  RsearchData: string = '';

  RRowData: RRow = {
    oid: '',
    uid: '',
    livro: '',
    Data: '',
    editMode: false
  };

  RCopyRowData: RRow = {
    oid: '',
    uid: '',
    livro: '',
    Data: '',
    editMode: false
  };

  rrows: RRow[] = [];
  roriginalRows: RRow[] = [];

  RfetchRowData() {
    this.getAllReserves().subscribe(
      (data: any[]) => {
        console.log('Reserves data from the server:', data);
        this.roriginalRows = data.map((item: any) => ({
          oid: item.odisseia,
          uid: item.id,
          livro: item.livroreservado,
          Data: item.datadareserva,
          editMode: false
        }));

        this.RresetFilter();
      },
      (error) => {
        console.error(error);
      }
    );
  }

  RapplyFilter() {
    if (
      this.RsearchOId === '' &&
      this.RsearchId === '' &&
      this.RsearchLivro === '' &&
      this.RsearchData === ''
    ) {
      this.rrows = [...this.roriginalRows];
    } else {
      this.rrows = this.roriginalRows.filter((row: RRow) =>
        row.oid.includes(this.RsearchOId) &&
        row.uid.includes(this.RsearchId) &&
        row.livro.toLowerCase().includes(this.RsearchLivro.toLowerCase()) &&
        row.Data.toLowerCase().includes(this.RsearchData.toLowerCase())
      );
    }
  }

  RresetFilter() {
    this.rrows = [...this.roriginalRows];
    this.RapplyFilter();
  }

  getAllReserves() {
    const url = this.APIUrl+'ObterTodasasReservasFunction';
    return this.http.get<any[]>(url);
  }

  RtoggleEditMode(row: RRow) {
    if (row.editMode) {
      this.RsaveRow(row);
    } else {
      row.editMode = true;
    }
  }

  RaddRow() {
    const url = this.APIUrl+'InserirReservasFunction';

    if (
      this.RRowData.oid.trim() !== '' &&
      this.RRowData.livro.trim() !== '' &&
      this.RRowData.Data.trim() !== ''
    ) {
      const payload = {
        odisseia: this.RRowData.oid,
        id: uuidv4(),
        datadareserva: this.RRowData.Data,
        livroreservado: this.RRowData.livro
      };

      this.rrows.push({
        oid: payload.odisseia,
        uid: payload.id,
        livro: this.RRowData.livro,
        Data: this.RRowData.Data,
        editMode: false
      });
      return this.http.post(url, payload).subscribe(
        (response) => {
          // Handle the response here
          console.log(response);
          // Reset the form or any necessary variables
          this.RcancelAddRow();
        },
        (error) => {
          // Handle any errors that occur during the request
          console.warn(error);
          this.RcancelAddRow();
        }
      );
    }else{
      this.RcancelAddRow();
      return ;
    }
  }

  RcancelAddRow() {
    this.showAddRow = false;
    this.RRowData = {
      oid: '',
      uid: '',
      livro: '',
      Data: '',
      editMode: false
    };
  }

  RsaveRow(row: RRow): void {
    if (this.RCopyRowData.Data !== undefined && this.RCopyRowData.Data.trim() !== '') {
      row.Data = this.RCopyRowData.Data;
    }
    if (this.RCopyRowData.livro !== undefined && this.RCopyRowData.livro.trim() !== '') {
      row.livro = this.RCopyRowData.livro;
    }

    this.updateReserv(row);
    this.RcancelEdit(row);
  }

  updateReserv(row: RRow) {
    const url = this.APIUrl+`AtualizarReservasFunction`;
    const payload = {
      id: row.uid,
      datadareserva: row.Data,
      livroreservado: row.livro,
      odisseia: row.oid
    };

    this.http.put(url, payload).subscribe(
      () => {
        console.log('Reserv updated successfully');
        // Handle any further actions after successful update
      },
      (error) => {
        console.error('Failed to update reserv:', error);
        // Handle error cases
      }
    );
  }

  RcancelEdit(row: RRow) {
    row.editMode = false;
    this.RCopyRowData = {
      oid: '',
      uid: '',
      livro: '',
      Data: '',
      editMode: false
    };
  }

  RdeleteRow(row: RRow) {
    const index = this.rrows.indexOf(row);

    if (index !== -1) {
      const Id = row.uid;
      this.deleteRegister(Id).subscribe(
        (response) => {
          console.warn(response);
          this.rrows.splice(index, 1);
        },
        (error) => {
          console.warn(error);
          this.rrows.splice(index, 1);
        }
      );

    }
  }

  deleteRegister(Id: string) {
    const url = this.APIUrl+`/Reservas/${Id}`;
    return this.http.delete(url);
  }

  RtoggleDeleteMode(row: any) {
    if (row.editMode) {
      // Cancel the edit mode
      this.RcancelEdit(row);
    } else {
      // Perform delete action
      this.RdeleteRow(row);
    }
  }
}


