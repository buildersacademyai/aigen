import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { generationProgress, GENERATION_EVENTS } from '@/lib/openai';

const steps = [
  { id: GENERATION_EVENTS.SOURCES_FOUND, label: 'Finding Sources' },
  { id: GENERATION_EVENTS.CONTENT_GENERATED, label: 'Generating Content' },
  { id: GENERATION_EVENTS.IMAGE_CREATED, label: 'Creating Image' },
  { id: GENERATION_EVENTS.ARTICLE_SAVED, label: 'Saving Article' },
  { id: GENERATION_EVENTS.AUDIO_CREATED, label: 'Creating Audio' },
];

export function GenerationProgress() {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleProgress = (event: Event) => {
      const customEvent = event as CustomEvent;
      setCompletedSteps(prev => new Set([...prev, customEvent.type]));
    };

    // Add listeners for all generation events
    Object.values(GENERATION_EVENTS).forEach(event => {
      generationProgress.addEventListener(event, handleProgress);
    });

    return () => {
      // Clean up listeners
      Object.values(GENERATION_EVENTS).forEach(event => {
        generationProgress.removeEventListener(event, handleProgress);
      });
    };
  }, []);

  return (
    <div className="space-y-2">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.has(step.id);
        const isInProgress = !isCompleted && 
          (index === 0 || completedSteps.has(steps[index - 1].id));

        return (
          <div
            key={step.id}
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
              isCompleted
                ? 'text-green-500 bg-green-500/10'
                : isInProgress
                ? 'text-blue-500 bg-blue-500/10'
                : 'text-muted-foreground'
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : isInProgress ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-current opacity-50" />
              )}
            </div>
            <span className="text-sm font-medium">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
