
import React from 'react';
import { Check, CpuIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AIModel, getAvailableModels } from '@/utils/ai';
import { cn } from '@/lib/utils';

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  disabled?: boolean;
  className?: string;
}

export function ModelSelector({ 
  selectedModel, 
  onModelChange, 
  disabled = false,
  className 
}: ModelSelectorProps) {
  const models = getAvailableModels();
  const currentModel = models.find(model => model.id === selectedModel) || models[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={cn(
            "gap-1.5 h-8 pr-3 text-xs sm:text-sm sm:gap-2 sm:pr-4",
            disabled && "opacity-70 cursor-not-allowed",
            className
          )}
          disabled={disabled}
        >
          <CpuIcon className="size-3.5 sm:size-4" />
          {currentModel.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            className="flex items-center justify-between gap-1 px-2.5 py-2"
            onClick={() => onModelChange(model.id)}
            disabled={disabled}
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{model.name}</span>
              <span className="text-xs text-muted-foreground">{model.description}</span>
            </div>
            {selectedModel === model.id && <Check className="size-4 text-accent" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
