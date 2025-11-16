export function calculateDaysUntilUnlock(dateDeblocage: string): number {
  const unlockDate = new Date(dateDeblocage);
  const today = new Date();
  const diffTime = unlockDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

export function getCompteStatut(compte: any): string {
  if (compte.typeCompte === 'CHEQUE') {
    return 'Actif';
  }

  if (compte.typeCompte === 'EPARGNE' && compte.dateDeblocage) {
    const daysLeft = calculateDaysUntilUnlock(compte.dateDeblocage);
    if (daysLeft > 0) {
      return `Bloqué (${daysLeft} jour${daysLeft > 1 ? 's' : ''})`;
    }
    return 'Actif';
  }

  return 'Actif';
}

export function getStatutClass(statut: string): string {
  if (statut === 'Actif') {
    return 'bg-green-100 text-green-800';
  }
  return 'bg-yellow-100 text-yellow-800';
}
