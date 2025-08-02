export interface GetProfileResponse {
  id: string;
  name: string;
  email: string;
  hasPassword: boolean;
  hasNewPosItems: boolean;
  isInSandboxMode: boolean;
  photoUrl: string;
  location?: {
    id: string;
    name: string;
  };
  plan: {
    plan: string;
    state: string;
    trialEnd: string;
  };
}