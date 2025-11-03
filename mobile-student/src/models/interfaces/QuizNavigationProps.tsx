export interface QuizNavigationProps {
    onPrevious: () => void;
    onNext: () => void;
    canGoPrevious: boolean;
    canGoNext: boolean;
    isLastQuestion: boolean;
}