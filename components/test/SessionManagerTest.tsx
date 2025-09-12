"use client";

import { useState } from 'react';
import { useSessionManager } from '@/hooks/useSessionManager';
import { useSession } from '@/auth/auth-client';
import { Button } from '@/components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Loader2, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function SessionManagerTest() {
  const { data: session } = useSession();
  const { 
    sessions, 
    loading, 
    error, 
    completeBreastfeeding, 
    recordBottleFeeding, 
    completeSleeping, 
    recordDiaperChange,
    refreshSessions 
  } = useSessionManager();
  
  const [testRunning, setTestRunning] = useState(false);

  const runTests = async () => {
    if (!session?.user) {
      toast.error('Please sign in to run tests');
      return;
    }

    setTestRunning(true);
    try {
      toast.success('Starting session tests...');

      // Test 1: Breastfeeding session
      await completeBreastfeeding(300000, 'Test breastfeeding session'); // 5 minutes
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test 2: Bottle feeding
      await recordBottleFeeding('120', 'ml', 'Test bottle feeding');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test 3: Sleep session
      await completeSleeping(1800000, 'Test sleep session'); // 30 minutes
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test 4: Diaper change
      await recordDiaperChange({
        dateTime: new Date(),
        diaperType: 'Wet & Dirty',
        amount: 'Medium',
        color: 'Yellow',
        texture: 'Normal',
        mood: 'happy',
        openAirAccident: false,
        diaperLeak: false,
        notes: 'Test diaper change'
      });

      toast.success('All tests completed successfully! 🎉');
    } catch (err) {
      toast.error('Test failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setTestRunning(false);
    }
  };

  const clearTestData = async () => {
    if (!session?.user) return;

    try {
      const testSessions = sessions.filter(s => 
        s.notes?.includes('Test ') || s.notes?.includes('test ')
      );

      for (const sessionToDelete of testSessions) {
        const response = await fetch(`/api/sessions/${sessionToDelete.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to delete session ${sessionToDelete.id}`);
        }
      }

      await refreshSessions();
      toast.success(`Cleared ${testSessions.length} test sessions`);
    } catch (err) {
      toast.error('Failed to clear test data: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (!session?.user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Session Manager Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Please sign in to test session functionality.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Session Manager Test
            <div className="flex gap-2">
              <Button
                onClick={refreshSessions}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={runTests}
                disabled={testRunning || loading}
              >
                {testRunning && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Run Tests
              </Button>
              <Button
                onClick={clearTestData}
                variant="destructive"
                size="sm"
                disabled={loading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Test Data
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700">Error: {error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900">Status</h3>
              <p className="text-blue-700">
                {loading ? 'Loading...' : `${sessions.length} sessions loaded`}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900">User</h3>
              <p className="text-green-700">{session.user.email}</p>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading sessions...
            </div>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sessions.map((sessionItem) => (
              <div
                key={sessionItem.id}
                className="border rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {sessionItem.type}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {sessionItem.startTime.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    ID: {sessionItem.id.slice(-8)}
                  </span>
                </div>
                
                <div className="text-sm space-y-1">
                  {sessionItem.duration && (
                    <p>Duration: {Math.floor(sessionItem.duration / 60)}m {sessionItem.duration % 60}s</p>
                  )}
                  
                  {sessionItem.type === 'bottle' && 'amount' in sessionItem && (
                    <p>Amount: {sessionItem.amount}{sessionItem.unit}</p>
                  )}
                  
                  {sessionItem.type === 'breastfeeding' && 'side' in sessionItem && sessionItem.side && (
                    <p>Side: {sessionItem.side}</p>
                  )}
                  
                  {sessionItem.type === 'diaper' && 'diaperType' in sessionItem && (
                    <p>Type: {sessionItem.diaperType}</p>
                  )}
                  
                  {sessionItem.notes && (
                    <p className="text-gray-600 italic">Notes: {sessionItem.notes}</p>
                  )}
                </div>
              </div>
            ))}
            
            {!loading && sessions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No sessions found. Run tests to create sample data.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}