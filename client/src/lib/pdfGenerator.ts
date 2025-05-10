import jsPDF from 'jspdf';
import { QuizData } from '@/context/QuizContext';

// Function to generate PDF with user's attempted answers
export function generateQuizAttemptPDF(
  quiz: QuizData,
  userAnswers: Array<{questionId: string; userAnswer: string | string[]; isCorrect: boolean}>
) {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Set title
  doc.setFontSize(20);
  doc.text(`${quiz.title} - Your Attempt`, 20, 20);
  
  // Set topic
  doc.setFontSize(14);
  doc.text(`Topic: ${quiz.topic}`, 20, 30);
  
  // Set date
  doc.setFontSize(12);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
  
  let y = 50;
  
  // For each question
  quiz.questions.forEach((question, index) => {
    // Check if we need to add a new page
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    
    // Get user's answer for this question
    const userAnswer = userAnswers.find(a => a.questionId === question.id);
    
    // Question
    doc.setFontSize(14);
    doc.text(`Question ${index + 1}: ${question.question}`, 20, y);
    y += 10;
    
    // If it has options, list them
    if (question.options && question.options.length > 0) {
      doc.setFontSize(12);
      question.options.forEach((option, optionIndex) => {
        // Bold if this was the user's answer
        const isSelected = userAnswer && 
          (Array.isArray(userAnswer.userAnswer) 
            ? userAnswer.userAnswer.includes(option)
            : userAnswer.userAnswer === option);
        
        if (isSelected) {
          doc.setFont(undefined, 'bold');
          doc.text(`${String.fromCharCode(65 + optionIndex)}. ${option} ← Your answer`, 30, y);
          doc.setFont(undefined, 'normal');
        } else {
          doc.text(`${String.fromCharCode(65 + optionIndex)}. ${option}`, 30, y);
        }
        y += 8;
      });
    } else {
      // For short answer
      if (userAnswer) {
        doc.setFontSize(12);
        doc.text('Your answer: ' + 
          (Array.isArray(userAnswer.userAnswer) 
            ? userAnswer.userAnswer.join(', ')
            : userAnswer.userAnswer), 30, y);
      }
      y += 8;
    }
    
    y += 10; // Extra space between questions
  });
  
  // Save the PDF
  doc.save(`${quiz.title}-Your-Attempt.pdf`);
}

// Function to generate PDF with correct answers and explanations
export function generateAnswerKeyPDF(quiz: QuizData) {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Set title
  doc.setFontSize(20);
  doc.text(`${quiz.title} - Answer Key`, 20, 20);
  
  // Set topic
  doc.setFontSize(14);
  doc.text(`Topic: ${quiz.topic}`, 20, 30);
  
  let y = 40;
  
  // For each question
  quiz.questions.forEach((question, index) => {
    // Check if we need to add a new page
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    
    // Question
    doc.setFontSize(14);
    doc.text(`Question ${index + 1}: ${question.question}`, 20, y);
    y += 10;
    
    // If it has options, list them
    if (question.options && question.options.length > 0) {
      doc.setFontSize(12);
      question.options.forEach((option, optionIndex) => {
        // Bold if this is the correct answer
        const isCorrect = Array.isArray(question.correctAnswer) 
          ? question.correctAnswer.includes(option)
          : question.correctAnswer === option;
        
        if (isCorrect) {
          doc.setFont(undefined, 'bold');
          doc.text(`${String.fromCharCode(65 + optionIndex)}. ${option} ✓ Correct`, 30, y);
          doc.setFont(undefined, 'normal');
        } else {
          doc.text(`${String.fromCharCode(65 + optionIndex)}. ${option}`, 30, y);
        }
        y += 8;
      });
    } else {
      // For short answer
      doc.setFontSize(12);
      doc.text('Correct answer: ' + 
        (Array.isArray(question.correctAnswer) 
          ? question.correctAnswer.join(', ')
          : question.correctAnswer), 30, y);
      y += 8;
    }
    
    // Explanation
    if (question.explanation) {
      doc.setFontSize(12);
      doc.setTextColor(0, 102, 204); // Blue text
      
      // Split long explanations into multiple lines
      const splitText = doc.splitTextToSize(question.explanation, 160);
      doc.text(splitText, 30, y);
      y += 8 * splitText.length;
      
      doc.setTextColor(0, 0, 0); // Reset to black
    }
    
    y += 15; // Extra space between questions
  });
  
  // Save the PDF
  doc.save(`${quiz.title}-Answer-Key.pdf`);
}