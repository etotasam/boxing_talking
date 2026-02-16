export type CommentType = {
  id: number;
  postUserName: string;
  comment: string;
  prediction: "red" | "blue" | undefined;
  createdAt: string;
};
