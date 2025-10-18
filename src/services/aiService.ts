// Path: src/services/aiService.ts

import { TestCase } from './testCaseService';

export interface AISuggestion {
    id: string;
    title: string;
    description: string;
}

/**
 * Simulates calling an AI model to get test case suggestions based on product requirements.
 * @param requirements The product requirements string.
 * @returns A promise that resolves with an array of AI-generated suggestions.
 */
export const getAISuggestions = (requirements: string): Promise<AISuggestion[]> => {
    console.log("Getting AI suggestions for:", requirements);
    return new Promise((resolve) => {
        setTimeout(() => {
            const suggestions: AISuggestion[] = [
                {
                    id: 'ai-sugg-1',
                    title: 'Verify successful login with valid credentials',
                    description: 'User enters a correct username and password, then clicks "Login". The user should be redirected to the dashboard.'
                },
                {
                    id: 'ai-sugg-2',
                    title: 'Verify login failure with invalid password',
                    description: 'User enters a correct username and an incorrect password. An error message "Invalid credentials" should be displayed.'
                },
                {
                    id: 'ai-sugg-3',
                    title: 'Verify "Remember Me" functionality',
                    description: 'User checks the "Remember Me" box, logs in successfully, closes the browser, and re-opens the page. The user should still be logged in.'
                },
                {
                    id: 'ai-sugg-4',
                    title: 'Verify password visibility toggle',
                    description: 'User clicks the "show/hide" icon in the password field. The password text should toggle between visible and obscured.'
                },
                {
                    id: 'ai-sugg-5',
                    title: 'Test login form with empty fields',
                    description: 'User leaves both username and password fields empty and clicks "Login". A validation message should appear for both fields.'
                }
            ];
            console.log("Received AI suggestions.");
            resolve(suggestions);
        }, 2500); // Simulate network and AI processing time
    });
};

/**
 * Simulates generating and saving the final test cases based on user selection.
 * @param selectedSuggestions The suggestions chosen by the user.
 * @param directoryId The directory where the test cases should be saved.
 * @param projectId The ID of the current project.
 * @returns A promise that resolves with the newly created test cases.
 */
export const generateTestCases = (
    selectedSuggestions: AISuggestion[],
    directoryId: string,
    projectId: string
): Promise<TestCase[]> => {
    console.log(`Generating ${selectedSuggestions.length} test cases in directory ${directoryId}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            const newTestCases: TestCase[] = selectedSuggestions.map((sugg, i) => ({
                id: `tc-ai-${new Date().getTime() + i}`,
                caseId: `TC-AI-${Math.floor(1000 + Math.random() * 9000)}`,
                name: sugg.title,
                // description: sugg.description, // Assuming TestCase might have a description field later
                priority: 'Medium', // Default priority
                status: 'Draft', // Default status
                assignee: 'Unassigned',
                lastUpdated: new Date().toLocaleDateString('en-US'),
                projectId: projectId,
                directory: directoryId,
            }));
            
            // Here you would typically add the newTestCases to the main mockTestCases array
            // in testCaseService, but for simplicity, we'll just return them.
            
            console.log("Successfully generated test cases:", newTestCases);
            resolve(newTestCases);
        }, 2000);
    });
};
