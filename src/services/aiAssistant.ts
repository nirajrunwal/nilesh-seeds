// Free AI Assistant using local error patterns and suggestions
// No external API required

interface ErrorPattern {
    pattern: RegExp;
    suggestions: string[];
    category: 'auth' | 'network' | 'data' | 'ui' | 'general';
}

const ERROR_PATTERNS: ErrorPattern[] = [
    {
        pattern: /login.*fail|invalid.*credentials/i,
        suggestions: [
            'Check if user exists in database',
            'Verify password matches stored hash',
            'Ensure user status is "active" not "blocked"',
            'Check if Remember Me feature is working correctly'
        ],
        category: 'auth'
    },
    {
        pattern: /fetch.*fail|network.*error|ECONNREFUSED/i,
        suggestions: [
            'Check internet connection',
            'Verify API endpoint URL is correct',
            'Check if server is running',
            'Try clearing browser cache'
        ],
        category: 'network'
    },
    {
        pattern: /undefined|null.*property|cannot read/i,
        suggestions: [
            'Add null/undefined checks before accessing properties',
            'Use optional chaining (?.)',
            'Ensure data is loaded before rendering',
            'Check if API returned expected data structure'
        ],
        category: 'data'
    },
    {
        pattern: /render|component|react/i,
        suggestions: [
            'Check component props are correct',
            'Ensure all required dependencies are installed',
            'Verify component is wrapped in proper providers',
            'Check for circular dependencies'
        ],
        category: 'ui'
    }
];

export class FreeAIAssistant {

    /**
     * Analyze error and provide suggestions
     */
    static analyze(error: string | Error): {
        error: string;
        category: string;
        suggestions: string[];
        relatedDocs: string[];
    } {
        const errorText = typeof error === 'string' ? error : error.message;

        // Find matching pattern
        const match = ERROR_PATTERNS.find(p => p.pattern.test(errorText));

        if (match) {
            return {
                error: errorText,
                category: match.category,
                suggestions: match.suggestions,
                relatedDocs: this.getRelatedDocs(match.category)
            };
        }

        // Default suggestions for unknown errors
        return {
            error: errorText,
            category: 'general',
            suggestions: [
                'Check browser console for more details',
                'Review recent code changes',
                'Clear localStorage and try again',
                'Check if all dependencies are installed'
            ],
            relatedDocs: ['https://nextjs.org/docs', 'https://react.dev']
        };
    }

    /**
     * Get related documentation links
     */
    private static getRelatedDocs(category: string): string[] {
        const docs: Record<string, string[]> = {
            auth: [
                'https://nextjs.org/docs/authentication',
                'https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API'
            ],
            network: [
                'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API',
                'https://nextjs.org/docs/api-reference/next.config.js/headers'
            ],
            data: [
                'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining',
                'https://react.dev/learn/conditional-rendering'
            ],
            ui: [
                'https://react.dev/learn',
                'https://nextjs.org/docs/app/building-your-application/rendering'
            ],
            general: [
                'https://nextjs.org/docs',
                'https://react.dev'
            ]
        };

        return docs[category] || docs.general;
    }

    /**
     * Get performance tips based on metrics
     */
    static getPerformanceTips(metrics: {
        loadTime?: number;
        apiCalls?: number;
        rerenders?: number;
    }): string[] {
        const tips: string[] = [];

        if (metrics.loadTime && metrics.loadTime > 3000) {
            tips.push('⚡ Page load time is slow. Consider code splitting with dynamic imports');
            tips.push('🖼️ Optimize images using Next.js Image component');
        }

        if (metrics.apiCalls && metrics.apiCalls > 10) {
            tips.push('🔄 Too many API calls. Consider batching or caching responses');
        }

        if (metrics.rerenders && metrics.rerenders > 5) {
            tips.push('♻️ Component rerendering frequently. Use React.memo or useMemo');
        }

        if (tips.length === 0) {
            tips.push('✅ Performance looks good!');
        }

        return tips;
    }

    /**
     * Smart code suggestions based on context
     */
    static suggestCode(context: string): string[] {
        const suggestions: string[] = [];

        if (context.includes('password') || context.includes('auth')) {
            suggestions.push(
                'Use bcrypt for password hashing',
                'Implement JWT tokens for sessions',
                'Add rate limiting for login attempts'
            );
        }

        if (context.includes('chat') || context.includes('message')) {
            suggestions.push(
                'Implement optimistic UI updates',
                'Add message delivery status',
                'Use WebSocket for real-time updates'
            );
        }

        if (context.includes('offline') || context.includes('cache')) {
            suggestions.push(
                'Implement service worker for offline support',
                'Use IndexedDB for local storage',
                'Add background sync for pending operations'
            );
        }

        return suggestions;
    }
}
