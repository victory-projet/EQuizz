import { Question } from "./Question";

export interface QuestionCardProps {
    question: Question;
    selectedOptions: string[];
    onOptionSelect: (optionId: string) => void;
}