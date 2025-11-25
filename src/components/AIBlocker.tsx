import { useEffect, useState, useRef } from 'react';
import { Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIBlockerProps {
  isActive: boolean;
  testId: string;
  onViolation: (violationType: string) => void;
  onFullscreenExit?: (exitCount: number) => void;
  enableFullscreen?: boolean;
  initialExitCount?: number;
}

export const AIBlocker = ({ isActive, testId, onViolation, onFullscreenExit, enableFullscreen = false, initialExitCount = 0 }: AIBlockerProps) => {
  const [violations, setViolations] = useState<string[]>([]);
  const [isBlocking, setIsBlocking] = useState(false);
  const isFullscreenTransitioning = useRef(false);
  const fullscreenInitialized = useRef(false);
  const lastViolationTime = useRef<number>(0);
  const fullscreenExitCount = useRef(0);
  const onViolationRef = useRef(onViolation);
  const onFullscreenExitRef = useRef(onFullscreenExit);

  useEffect(() => {
    onViolationRef.current = onViolation;
    onFullscreenExitRef.current = onFullscreenExit;
    fullscreenExitCount.current = initialExitCount;
  }, [onViolation, onFullscreenExit, initialExitCount]);

  useEffect(() => {
    if (!isActive) return;

    setIsBlocking(true);
    const activatedAt = Date.now();
    
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
      // ignore first 5s after activation to avoid false positives from extensions
      if (Date.now() - activatedAt < 5000) return;
      // Ignore during fullscreen transition
      if (isFullscreenTransitioning.current) return;
      // Ignore if currently in fullscreen mode (transitions often cause blur)
      if (document.fullscreenElement) return;
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

      // F12 function key (allow F11 for fullscreen toggle)
      if (e.key === 'F12') {
        e.preventDefault();
        handleViolation('Function Key Blocked: ' + e.key);
        return false;
      }
    };

    // 6b. Block untrusted/automated interactions
    const blockUntrusted = (e: Event) => {
      if ((e as any).isTrusted === false) {
        e.preventDefault();
        // prevent bubbling to React handlers
        // @ts-ignore
        if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
        handleViolation('Automated Interaction Blocked');
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
      const keywords = ['chatgpt','claude','comet','copilot','perplexity','assistant','ai-chat','grok','gemini','bard'];
      const iframes = document.getElementsByTagName('iframe');
      for (let iframe of iframes) {
        const src = (iframe.src || '').toLowerCase();
        if (keywords.some(term => src.includes(term))) {
          handleViolation('AI Assistant UI Detected in iframe');
          try { iframe.remove(); } catch {}
        }
      }

      // Detect injected sidebars/overlays
      const selector = keywords.map(k => `[class*="${k}"],[id*="${k}"],[aria-label*="${k}"],[data-testid*="${k}"]`).join(',');
      const candidates = document.querySelectorAll(selector);
      candidates.forEach((el) => {
        const style = window.getComputedStyle(el as Element);
        const isOverlay = ['fixed','sticky'].includes(style.position) || Number.parseInt(style.zIndex || '0') > 1000;
        if (isOverlay) {
          handleViolation('AI Assistant Overlay Detected');
          try { (el as Element).remove(); } catch {}
        }
      });
    };

    // 8b. Visibility change detection
    const detectVisibilityChange = () => {
      // Ignore during fullscreen transition
      if (isFullscreenTransitioning.current) return;
      // Ignore until fullscreen is initialized (3 second grace period)
      if (!fullscreenInitialized.current) return;
      
      if (document.hidden) {
        handleViolation('Page Hidden / Backgrounded');
      }
    };

    // 8c. Message activity from potential assistants
    const messageListener = (event: MessageEvent) => {
      const origin = (event.origin || '').toLowerCase();
      const dataStr = (typeof event.data === 'string' ? event.data : JSON.stringify(event.data || '')).toLowerCase();
      const suspect = ['chatgpt','claude','comet','copilot','perplexity','assistant','ai-chat','grok','gemini','bard'];
      if (suspect.some(k => origin.includes(k) || dataStr.includes(k))) {
        handleViolation('AI Assistant Message Activity');
      }
    };

    // 9. Fullscreen Enforcement (optional on mobile)
    const enforceFullscreen = () => {
      if (!enableFullscreen) return;
      if (!document.fullscreenElement && window.innerWidth > 768) {
        // Mark as transitioning
        isFullscreenTransitioning.current = true;
        setTimeout(() => { isFullscreenTransitioning.current = false; }, 1500);
        
        // Try to re-enter fullscreen; if denied, do NOT treat as a violation
        document.documentElement.requestFullscreen?.().catch(() => {
          console.warn('Fullscreen request denied while enforcing.');
        });
      }
    };
    
    // Track fullscreen transitions to avoid false positives
    const handleFullscreenChange = () => {
      isFullscreenTransitioning.current = true;
      setTimeout(() => { isFullscreenTransitioning.current = false; }, 1500);
      
      // Detect when user exits fullscreen (e.g., pressing Escape)
      if (!document.fullscreenElement && enableFullscreen && window.innerWidth > 768) {
        fullscreenExitCount.current += 1;
        const exitCount = fullscreenExitCount.current;
        
        console.log(`🔔 Fullscreen exited (${exitCount}/3)`);
        
        // Notify parent component to pause test
        if (onFullscreenExitRef.current) {
          onFullscreenExitRef.current(exitCount);
        }
      }
    };

    const reported = new Set<string>();

    const handleViolation = (message: string) => {
      if (reported.has(message)) return; // de-duplicate noisy events
      // Debounce rapid violations (within 2 seconds)
      if (Date.now() - lastViolationTime.current < 2000) return;
      
      lastViolationTime.current = Date.now();
      reported.add(message);
      console.warn('🚨 Security Violation:', message);
      setViolations(prev => [...prev, message]);
      onViolationRef.current(message);
      
      // Log to backend
      logViolation(message);
      
      // Show toast warning (auto-dismisses after 3 seconds)
      toast.error('Security Violation', {
        description: message,
        duration: 3000,
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
    document.addEventListener('click', blockUntrusted, true);
    document.addEventListener('input', blockUntrusted, true);
    document.addEventListener('change', blockUntrusted, true);
    window.addEventListener('blur', detectTabSwitch);
    document.addEventListener('visibilitychange', detectVisibilityChange);
    window.addEventListener('message', messageListener);
    if (enableFullscreen) {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    }

    // Run detections
    detectExtensions();
    monitorNetworkRequests();
    detectAIAssistantUI();
    
    // Observe DOM for injected assistant UI
    const uiObserver = new MutationObserver(() => {
      detectExtensions();
      detectAIAssistantUI();
    });
    try { uiObserver.observe(document.body, { childList: true, subtree: true }); } catch {}
    
    // Periodic checks
    const detectionInterval = setInterval(() => {
      detectExtensions();
      detectDevTools();
      detectAIAssistantUI();
    }, 3000);

    // Request fullscreen on desktop only when enabled
    if (enableFullscreen && window.innerWidth > 768) {
      setTimeout(() => {
        document.documentElement.requestFullscreen?.().catch(() => {
          console.warn('Initial fullscreen request denied.');
        });
        // Set fullscreen initialized after grace period
        setTimeout(() => { fullscreenInitialized.current = true; }, 3000);
      }, 500);
    } else if (!enableFullscreen) {
      // If fullscreen not enabled, immediately mark as initialized
      fullscreenInitialized.current = true;
    }

    // Cleanup
    return () => {
      document.removeEventListener('copy', blockCopyPaste);
      document.removeEventListener('cut', blockCopyPaste);
      document.removeEventListener('paste', blockCopyPaste);
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('keydown', blockKeyboardShortcuts);
      document.removeEventListener('click', blockUntrusted, true);
      document.removeEventListener('input', blockUntrusted, true);
      document.removeEventListener('change', blockUntrusted, true);
      window.removeEventListener('blur', detectTabSwitch);
      document.removeEventListener('visibilitychange', detectVisibilityChange);
      window.removeEventListener('message', messageListener);
      if (enableFullscreen) {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
      }
      clearInterval(detectionInterval);
      try { uiObserver.disconnect(); } catch {}
      
      // Exit fullscreen
      if (enableFullscreen && document.fullscreenElement) {
        document.exitFullscreen?.();
      }
      
      setIsBlocking(false);
    };
  }, [isActive, testId, enableFullscreen]);

  if (!isBlocking) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/80 border border-green-200 dark:border-green-800 rounded-lg px-3 py-1.5 shadow-sm">
        <Shield className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
        <span className="text-xs font-medium text-green-800 dark:text-green-200">
          AI Blocking Active
        </span>
      </div>
    </div>
  );
};
