export enum TypeCompte {
  EPARGNE = 'EPARGNE',
  CHEQUE = 'CHEQUE'
}

export interface Compte {
  id: string;
  numeroCompte: string;
  solde: number;
  typeCompte: TypeCompte;
  isActive: boolean;
  clientId: string;
  clientNomComplet: string;
  dateDeblocage?: string;
  tauxFrais?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompteEpargneRequest {
  clientId: string;
  typeCompte: TypeCompte.EPARGNE;
  soldeInitial: number;
  dateDeblocage: string;
}

export interface CreateCompteChequeRequest {
  clientId: string;
  typeCompte: TypeCompte.CHEQUE;
  soldeInitial: number;
}

export type CreateCompteRequest = CreateCompteEpargneRequest | CreateCompteChequeRequest;

export interface CompteDetails {
  compte: Compte;
  totalDepots: number;
  totalRetraits: number;
  nombreTransactions: number;
}
