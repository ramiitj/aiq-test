import { useEffect, useState } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIBlockerProps {
  isActive: boolean;
  testId: string;
  onViolation: (violationType: string) => void;
}

export const AIBlocker = ({ isActive, testId, onViolation }: AIBlockerProps) => {
  const [violations, setViolations] = useState<string[]>([]);
  const [isBlocking, setIsBlocking] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    setIsBlocking(true);
    
    // 1. Detect AI Assistant Browser Extensions
    const detectExtensions = () => {
      const suspiciousExtensions = [
        'comet', 'chatgpt', 'claude', 'grok', 'perplexity', 
        'gemini', 'copilot', 'jasper', 'writesonic', 'notion-ai',
        'grammarly', 'quillbot', 'wordtune'
      ];

      // Check for extension-injected elements
      const scripts = document.getElementsByTagName('script');
      for (let script of scripts) {
        const src = script.src.toLowerCase();
        if (suspiciousExtensions.some(ext => src.includes(ext))) {
          handleViolation('AI Extension Detected: ' + src);
        }
      }

      // Check for extension-injected DOM elements
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        const classNames = el.className?.toString().toLowerCase() || '';
        const id = el.id?.toLowerCase() || '';
        
        if (suspiciousExtensions.some(ext => 
          classNames.includes(ext) || id.includes(ext)
        )) {
          handleViolation('AI Extension UI Detected');
        }
      });
    };

    // 2. Block Copy-Paste
    const blockCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      handleViolation('Copy/Paste Attempt');
      return false;
    };

    // 3. Block Context Menu (Right Click)
    const blockContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      handleViolation('Context Menu Access Attempt');
      return false;
    };

    // 4. Detect Tab Switching / Window Blur
    const detectTabSwitch = () => {
      handleViolation('Tab/Window Switch Detected');
    };

    // 5. Detect DevTools Opening
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        handleViolation('Developer Tools Detected');
      }
    };

    // 6. Block Specific Keyboard Shortcuts
    const blockKeyboardShortcuts = (e: KeyboardEvent) => {
      const blockedCombos = [
        { key: 'c', ctrl: true }, // Ctrl+C
        { key: 'v', ctrl: true }, // Ctrl+V
        { key: 'x', ctrl: true }, // Ctrl+X
        { key: 'a', ctrl: true }, // Ctrl+A
        { key: 'f', ctrl: true }, // Ctrl+F
        { key: 's', ctrl: true }, // Ctrl+S
        { key: 'p', ctrl: true }, // Ctrl+P
        { key: 'u', ctrl: true }, // Ctrl+U
        { key: 'i', ctrl: true, shift: true }, // Ctrl+Shift+I (DevTools)
        { key: 'j', ctrl: true, shift: true }, // Ctrl+Shift+J (Console)
        { key: 'c', ctrl: true, shift: true }, // Ctrl+Shift+C (Inspect)
      ];

      const isBlocked = blockedCombos.some(combo => {
        const ctrlMatch = combo.ctrl ? (e.ctrlKey || e.metaKey) : true;
        const shiftMatch = combo.shift ? e.shiftKey : !e.shiftKey;
        return combo.key === e.key && ctrlMatch && shiftMatch;
      });

      if (isBlocked) {
        e.preventDefault();
        handleViolation(`Blocked Shortcut: ${e.ctrlKey || e.metaKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}`);
        return false;
      }

      // F12 and other function keys
      if (e.key === 'F12' || e.key === 'F11') {
        e.preventDefault();
        handleViolation('Function Key Blocked: ' + e.key);
        return false;
      }
    };

    // 7. Monitor Network Requests to AI APIs
    const monitorNetworkRequests = () => {
      const originalFetch = window.fetch;

      // Override fetch
      window.fetch = function(...args: Parameters<typeof fetch>) {
        const url = args[0]?.toString().toLowerCase() || '';
        
        if (isAIAPICall(url)) {
          handleViolation('Blocked AI API Call: ' + url);
          return Promise.reject(new Error('AI API calls blocked during assessment'));
        }
        
        return originalFetch.apply(this, args);
      };
    };

    // Check if URL is an AI API
    const isAIAPICall = (url: string): boolean => {
      const aiDomains = [
        'api.openai.com',
        'api.anthropic.com',
        'generativelanguage.googleapis.com',
        'api.perplexity.ai',
        'api.cohere.ai',
        'grok.x.ai',
        'claude.ai',
        'chatgpt.com',
        'chat.openai.com',
      ];

      return aiDomains.some(domain => url.includes(domain));
    };

    // 8. Detect AI Assistant Popups/Sidebars
    const detectAIAssistantUI = () => {
      const iframes = document.getElementsByTagName('iframe');
      for (let iframe of iframes) {
        const src = iframe.src.toLowerCase();
        const suspiciousTerms = ['chatgpt', 'claude', 'comet', 'copilot', 'assistant', 'ai-chat'];
        if (suspiciousTerms.some(term => src.includes(term))) {
          handleViolation('AI Assistant UI Detected in iframe');
          iframe.remove();
        }
      }
    };

    // 9. Fullscreen Enforcement (optional on mobile)
    const enforceFullscreen = () => {
      if (!document.fullscreenElement && window.innerWidth > 768) {
        handleViolation('Exited Fullscreen Mode');
      }
    };

    const handleViolation = (message: string) => {
      console.warn('🚨 Security Violation:', message);
      setViolations(prev => [...prev, message]);
      onViolation(message);
      
      // Log to backend
      logViolation(message);
      
      // Show toast warning
      toast.error('Security Violation Detected', {
        description: message,
        duration: 5000,
      });
    };

    const logViolation = async (message: string) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('security_violations').insert({
          test_id: testId,
          user_id: user.id,
          violation_type: message,
          user_agent: navigator.userAgent,
          additional_data: {
            timestamp: new Date().toISOString(),
            url: window.location.href,
          }
        });

        // Update test violation count
        const { data: test } = await supabase
          .from('tests')
          .select('security_violations_count')
          .eq('id', testId)
          .single();

        if (test) {
          await supabase
            .from('tests')
            .update({ 
              security_violations_count: (test.security_violations_count || 0) + 1 
            })
            .eq('id', testId);
        }
      } catch (error) {
        console.error('Failed to log violation:', error);
      }
    };

    // Attach all listeners
    document.addEventListener('copy', blockCopyPaste);
    document.addEventListener('cut', blockCopyPaste);
    document.addEventListener('paste', blockCopyPaste);
    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('keydown', blockKeyboardShortcuts);
    window.addEventListener('blur', detectTabSwitch);
    document.addEventListener('fullscreenchange', enforceFullscreen);

    // Run detections
    detectExtensions();
    monitorNetworkRequests();
    
    // Periodic checks
    const detectionInterval = setInterval(() => {
      detectExtensions();
      detectDevTools();
      detectAIAssistantUI();
    }, 3000);

    // Request fullscreen on desktop
    if (window.innerWidth > 768) {
      document.documentElement.requestFullscreen?.().catch(() => {
        handleViolation('Fullscreen Request Denied');
      });
    }

    // Cleanup
    return () => {
      document.removeEventListener('copy', blockCopyPaste);
      document.removeEventListener('cut', blockCopyPaste);
      document.removeEventListener('paste', blockCopyPaste);
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('keydown', blockKeyboardShortcuts);
      window.removeEventListener('blur', detectTabSwitch);
      document.removeEventListener('fullscreenchange', enforceFullscreen);
      clearInterval(detectionInterval);
      
      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
      }
      
      setIsBlocking(false);
    };
  }, [isActive, testId, onViolation]);

  if (!isBlocking) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-2">
      <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
        <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertDescription className="text-green-800 dark:text-green-200 text-sm">
          🔒 AI Blocking Active - Assessment Protected
        </AlertDescription>
      </Alert>
      
      {violations.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Violations: {violations.length}</strong>
            <div className="text-xs mt-1 opacity-90">
              Latest: {violations[violations.length - 1]}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
