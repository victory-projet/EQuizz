import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { PreviewModalComponent } from '../../components/modals/preview-modal/preview-modal';
import { EditModalComponent } from '../../components/modals/edit-modal/edit-modal';
import { PublishModalComponent } from '../../components/modals/publish-modal/publish-modal';
import { DeleteModalComponent } from '../../components/modals/delete-modal/delete-modal';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  constructor(private dialog: MatDialog) {}

  openPreview(quiz: any): Observable<any> {
    return this.dialog.open(PreviewModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      height: '80vh',
      data: { quiz },
      panelClass: 'preview-modal'
    }).afterClosed();
  }

  openEdit(quiz: any): Observable<any> {
    return this.dialog.open(EditModalComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: { quiz },
      panelClass: 'edit-modal'
    }).afterClosed();
  }

  openPublish(quiz: any): Observable<any> {
    return this.dialog.open(PublishModalComponent, {
      width: '500px',
      data: { quiz },
      panelClass: 'publish-modal'
    }).afterClosed();
  }

  openDelete(quiz: any): Observable<any> {
    return this.dialog.open(DeleteModalComponent, {
      width: '450px',
      data: { quiz },
      panelClass: 'delete-modal'
    }).afterClosed();
  }
}
