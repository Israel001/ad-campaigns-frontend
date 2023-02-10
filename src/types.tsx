export interface ICampaign {
  createdAt: Date;
  dailyBudget: number;
  from: Date;
  id: number;
  name: string;
  to: Date;
  totalBudget: number;
  updatedAt: Date;
}

export interface IModal {
  showModal: boolean;
  handleClose: () => void;
  images: string[];
  loading: boolean;
}