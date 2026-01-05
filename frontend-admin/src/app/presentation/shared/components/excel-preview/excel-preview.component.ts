import { Component, Input, Output, EventEmitter, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  ExcelPreviewService, 
  ExcelPreviewData, 
  ExcelSheetPreview, 
  ExcelImportConfig,
  ExcelValidationError,
  ExcelValidationWarning
} from '../../../../core/services/excel-preview.service';

@Component({
  selector: 'app-excel-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="excel-preview" [class.compact]="compact">
      <!-- Header avec informations du fichier -->
      <div class="preview-header">
        <div class="file-info">
          <div class="file-icon">
            <span class="material-icons">description</span>
          </div>
          <div class="file-details">
            <h3>{{ previewData()?.fileName }}</h3>
            <div class="file-meta">
              <span class="file-size">{{ formatFileSize(previewData()?.fileSize || 0) }}</span>
              <span class="separator">•</span>
              <span class="sheet-count">{{ previewData()?.sheets?.length || 0 }} feuille(s)</span>
              <span class="separator">•</span>
              <span class="row-count">{{ previewData()?.totalRows }} ligne(s)</span>
            </div>
          </div>
        </div>

        <!-- Indicateurs de validation -->
        <div class="validation-indicators">
          @if (previewData()?.hasErrors) {
            <div class="indicator error" title="Erreurs détectées">
              <span class="material-icons">error</span>
              <span>{{ errorCount() }}</span>
            </div>
          }
          @if (warningCount() > 0) {
            <div class="indicator warning" title="Avertissements">
              <span class="material-icons">warning</span>
              <span>{{ warningCount() }}</span>
            </div>
          }
          @if (!previewData()?.hasErrors && warningCount() === 0) {
            <div class="indicator success" title="Validation réussie">
              <span class="material-icons">check_circle</span>
              <span>Valide</span>
            </div>
          }
        </div>
      </div>

      <!-- Onglets des feuilles -->
      @if (previewData()?.sheets && previewData()!.sheets.length > 1) {
        <div class="sheet-tabs">
          @for (sheet of previewData()!.sheets; track sheet.name) {
            <button 
              class="sheet-tab" 
              [class.active]="selectedSheet() === sheet.name"
              [class.has-data]="sheet.hasData"
              (click)="selectSheet(sheet.name)">
              <span class="sheet-name">{{ sheet.name }}</span>
              <span class="sheet-info">({{ sheet.rowCount }} lignes)</span>
              @if (!sheet.hasData) {
                <span class="material-icons empty-indicator" title="Feuille vide">warning</span>
              }
            </button>
          }
        </div>
      }

      <!-- Contenu principal -->
      <div class="preview-content">
        <!-- Messages d'erreur et d'avertissement -->
        @if (showValidation && (errorCount() > 0 || warningCount() > 0)) {
          <div class="validation-messages">
            <!-- Erreurs -->
            @if (errorCount() > 0) {
              <div class="message-group errors">
                <div class="message-header" (click)="toggleErrors()">
                  <span class="material-icons">error</span>
                  <span>{{ errorCount() }} erreur(s)</span>
                  <span class="material-icons toggle-icon" [class.rotated]="showErrors()">
                    expand_more
                  </span>
                </div>
                @if (showErrors()) {
                  <div class="message-list">
                    @for (error of filteredErrors(); track $index) {
                      <div class="message-item error">
                        <div class="message-content">
                          <div class="message-text">{{ error.message }}</div>
                          <div class="message-location">
                            Feuille: {{ error.sheet }}
                            @if (error.row) {
                              • Ligne: {{ error.row }}
                            }
                            @if (error.column) {
                              • Colonne: {{ error.column }}
                            }
                          </div>
                        </div>
                        <span class="material-icons message-icon">error</span>
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <!-- Avertissements -->
            @if (warningCount() > 0) {
              <div class="message-group warnings">
                <div class="message-header" (click)="toggleWarnings()">
                  <span class="material-icons">warning</span>
                  <span>{{ warningCount() }} avertissement(s)</span>
                  <span class="material-icons toggle-icon" [class.rotated]="showWarnings()">
                    expand_more
                  </span>
                </div>
                @if (showWarnings()) {
                  <div class="message-list">
                    @for (warning of filteredWarnings(); track $index) {
                      <div class="message-item warning">
                        <div class="message-content">
                          <div class="message-text">{{ warning.message }}</div>
                          <div class="message-location">
                            Feuille: {{ warning.sheet }}
                            @if (warning.row) {
                              • Ligne: {{ warning.row }}
                            }
                            @if (warning.column) {
                              • Colonne: {{ warning.column }}
                            }
                          </div>
                        </div>
                        <span class="material-icons message-icon">warning</span>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Statistiques -->
        @if (showStatistics && statistics()) {
          <div class="statistics-panel">
            <h4>Statistiques des données</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ statistics()!.totalCells }}</div>
                <div class="stat-label">Cellules totales</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ statistics()!.filledCells }}</div>
                <div class="stat-label">Cellules remplies</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ statistics()!.fillRate.toFixed(1) }}%</div>
                <div class="stat-label">Taux de remplissage</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ statistics()!.averageRowLength.toFixed(1) }}</div>
                <div class="stat-label">Colonnes par ligne</div>
              </div>
            </div>

            <!-- Types de données -->
            @if (getObjectKeys(statistics()!.dataTypes).length > 0) {
              <div class="data-types">
                <h5>Types de données détectés</h5>
                <div class="type-list">
                  @for (type of getObjectEntries(statistics()!.dataTypes); track type[0]) {
                    <div class="type-item">
                      <span class="type-name">{{ getDataTypeLabel(type[0]) }}</span>
                      <span class="type-count">{{ type[1] }}</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- Prévisualisation des données -->
        @if (currentSheet()) {
          <div class="data-preview">
            <div class="preview-header-row">
              <h4>Aperçu des données - {{ currentSheet()!.name }}</h4>
              <div class="preview-controls">
                <button 
                  class="btn-toggle" 
                  [class.active]="showAllColumns()"
                  (click)="toggleAllColumns()"
                  title="Afficher toutes les colonnes">
                  <span class="material-icons">view_column</span>
                </button>
                <button 
                  class="btn-toggle" 
                  [class.active]="showEmptyCells()"
                  (click)="toggleEmptyCells()"
                  title="Afficher les cellules vides">
                  <span class="material-icons">visibility</span>
                </button>
              </div>
            </div>

            @if (currentSheet()!.hasData) {
              <div class="table-container" [class.show-all-columns]="showAllColumns()">
                <table class="data-table">
                  <!-- En-têtes -->
                  <thead>
                    <tr>
                      <th class="row-number">#</th>
                      @for (header of displayedHeaders(); track $index) {
                        <th class="data-header" [title]="header">
                          {{ header || 'Colonne ' + ($index + 1) }}
                        </th>
                      }
                    </tr>
                  </thead>
                  
                  <!-- Données -->
                  <tbody>
                    @for (row of displayedData(); track $index) {
                      <tr class="data-row">
                        <td class="row-number">{{ $index + 1 }}</td>
                        @for (cell of row; track $index) {
                          <td 
                            class="data-cell" 
                            [class.empty]="isEmpty(cell)"
                            [class.long-text]="isLongText(cell)"
                            [title]="getCellTooltip(cell)">
                            @if (isEmpty(cell) && showEmptyCells()) {
                              <span class="empty-indicator">—</span>
                            } @else {
                              <span class="cell-content">{{ formatCellValue(cell) }}</span>
                            }
                          </td>
                        }
                      </tr>
                    }
                  </tbody>
                </table>

                @if (currentSheet()!.rowCount > displayedData().length) {
                  <div class="more-rows-indicator">
                    <span class="material-icons">more_horiz</span>
                    <span>{{ currentSheet()!.rowCount - displayedData().length }} ligne(s) supplémentaire(s)</span>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-sheet">
                <span class="material-icons">inbox</span>
                <h4>Feuille vide</h4>
                <p>Cette feuille ne contient aucune donnée</p>
              </div>
            }
          </div>
        }
      </div>

      <!-- Actions -->
      @if (showActions) {
        <div class="preview-actions">
          <button class="btn-secondary" (click)="onCancel()">
            <span class="material-icons">close</span>
            Annuler
          </button>
          
          @if (allowRetry) {
            <button class="btn-secondary" (click)="onRetry()">
              <span class="material-icons">refresh</span>
              Choisir un autre fichier
            </button>
          }
          
          <button 
            class="btn-primary" 
            [disabled]="previewData()?.hasErrors"
            (click)="onConfirm()"
            [title]="previewData()?.hasErrors ? 'Corrigez les erreurs avant de continuer' : 'Confirmer l\\'import'">
            <span class="material-icons">check</span>
            Confirmer l'import
          </button>
        </div>
      }
    </div>
  `,
  styleUrls: ['./excel-preview.component.scss']
})
export class ExcelPreviewComponent implements OnInit {
  @Input() file: File | null = null;
  @Input() config: ExcelImportConfig | null = null;
  @Input() compact = false;
  @Input() showValidation = true;
  @Input() showStatistics = true;
  @Input() showActions = true;
  @Input() allowRetry = true;
  @Input() maxPreviewRows = 10;

  @Output() confirmed = new EventEmitter<ExcelPreviewData>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();

  // État
  previewData = signal<ExcelPreviewData | null>(null);
  selectedSheet = signal<string>('');
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Options d'affichage
  showErrors = signal(false);
  showWarnings = signal(false);
  showAllColumns = signal(false);
  showEmptyCells = signal(true);

  // Computed values
  currentSheet = computed(() => {
    const data = this.previewData();
    const selected = this.selectedSheet();
    return data?.sheets.find(sheet => sheet.name === selected) || data?.sheets[0] || null;
  });

  errorCount = computed(() => {
    return this.previewData()?.errors.filter(e => e.severity === 'error').length || 0;
  });

  warningCount = computed(() => {
    return this.previewData()?.warnings.length || 0;
  });

  filteredErrors = computed(() => {
    const data = this.previewData();
    const selected = this.selectedSheet();
    return data?.errors.filter(e => 
      e.severity === 'error' && (selected === '' || e.sheet === selected)
    ) || [];
  });

  filteredWarnings = computed(() => {
    const data = this.previewData();
    const selected = this.selectedSheet();
    return data?.warnings.filter(w => 
      selected === '' || w.sheet === selected
    ) || [];
  });

  displayedHeaders = computed(() => {
    const sheet = this.currentSheet();
    if (!sheet) return [];
    
    if (this.showAllColumns()) {
      return sheet.headers;
    }
    
    // Limiter à 8 colonnes pour l'affichage compact
    return sheet.headers.slice(0, 8);
  });

  displayedData = computed(() => {
    const sheet = this.currentSheet();
    if (!sheet) return [];
    
    let data = sheet.data.slice(0, this.maxPreviewRows);
    
    if (!this.showAllColumns()) {
      // Limiter aux 8 premières colonnes
      data = data.map(row => row.slice(0, 8));
    }
    
    return data;
  });

  statistics = signal<any>(null);

  constructor(private excelPreviewService: ExcelPreviewService) {}

  ngOnInit(): void {
    if (this.file) {
      this.analyzeFile();
    }
  }

  async analyzeFile(): Promise<void> {
    if (!this.file) return;

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const previewData = await this.excelPreviewService.analyzeExcelFile(this.file, this.config || undefined);
      this.previewData.set(previewData);
      
      // Sélectionner la première feuille avec des données
      const firstSheetWithData = previewData.sheets.find(sheet => sheet.hasData);
      if (firstSheetWithData) {
        this.selectedSheet.set(firstSheetWithData.name);
      } else if (previewData.sheets.length > 0) {
        this.selectedSheet.set(previewData.sheets[0].name);
      }

      // Générer les statistiques
      const stats = this.excelPreviewService.generateDataStatistics(previewData);
      this.statistics.set(stats);

    } catch (error) {
      this.error.set(`Erreur lors de l'analyse: ${error}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  // === ACTIONS ===

  selectSheet(sheetName: string): void {
    this.selectedSheet.set(sheetName);
  }

  toggleErrors(): void {
    this.showErrors.set(!this.showErrors());
  }

  toggleWarnings(): void {
    this.showWarnings.set(!this.showWarnings());
  }

  toggleAllColumns(): void {
    this.showAllColumns.set(!this.showAllColumns());
  }

  toggleEmptyCells(): void {
    this.showEmptyCells.set(!this.showEmptyCells());
  }

  onConfirm(): void {
    const data = this.previewData();
    if (data && !data.hasErrors) {
      this.confirmed.emit(data);
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onRetry(): void {
    this.retry.emit();
  }

  // === HELPERS ===

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isEmpty(value: any): boolean {
    return value === null || value === undefined || value === '';
  }

  isLongText(value: any): boolean {
    return typeof value === 'string' && value.length > 50;
  }

  formatCellValue(value: any): string {
    if (this.isEmpty(value)) return '';
    
    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...';
    }
    
    return String(value);
  }

  getCellTooltip(value: any): string {
    if (this.isEmpty(value)) return 'Cellule vide';
    
    if (typeof value === 'string' && value.length > 50) {
      return value;
    }
    
    return '';
  }

  getDataTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'text': 'Texte',
      'integer': 'Nombre entier',
      'decimal': 'Nombre décimal',
      'date': 'Date',
      'email': 'Email',
      'boolean': 'Booléen',
      'number_string': 'Nombre (texte)',
      'date_string': 'Date (texte)',
      'unknown': 'Inconnu'
    };
    return labels[type] || type;
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  getObjectEntries(obj: any): [string, any][] {
    return Object.entries(obj || {});
  }
}