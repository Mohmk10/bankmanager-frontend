export enum TypeTransaction {
  DEPOT = 'DEPOT',
  RETRAIT = 'RETRAIT'
}

export enum StatutTransaction {
  EN_ATTENTE = 'EN_ATTENTE',
  COMPLETEE = 'COMPLETEE',
  ECHOUEE = 'ECHOUEE',
  ANNULEE = 'ANNULEE'
}

export interface Transaction {
  id: string;
  idTransaction: string;
  type: TypeTransaction;
  montant: number;
  frais: number;
  soldeApres: number;
  statut: StatutTransaction;
  description: string;
  compteId: string;
  numeroCompte: string;
  dateTransaction: Date;
}

export interface CreateTransactionRequest {
  compteId: string;
  type: TypeTransaction;
  montant: number;
  description?: string;
}
