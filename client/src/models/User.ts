export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  isInSandboxMode: boolean;
  location: {
    id: string;
  };
  accountId: string;
  plan: {
    state: string;
    plan: string;
    trialEnd: string;
  }
}
