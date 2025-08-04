import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';

interface CycleFormProps {
  onClose: () => void;
  onCycleAdded: () => void;
}

const commonSymptoms = [
  'Cramps', 'Bloating', 'Mood swings', 'Fatigue', 'Headache',
  'Breast tenderness', 'Acne', 'Food cravings', 'Back pain', 'Nausea'
];

const CycleForm = ({ onClose, onCycleAdded }: CycleFormProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const cycleLength = formData.get('cycleLength') as string;
    const periodLength = formData.get('periodLength') as string;
    const notes = formData.get('notes') as string;

    try {
      const { error } = await supabase
        .from('cycles')
        .insert({
          user_id: user?.id,
          start_date: startDate,
          end_date: endDate || null,
          cycle_length: cycleLength ? parseInt(cycleLength) : null,
          period_length: periodLength ? parseInt(periodLength) : null,
          symptoms: selectedSymptoms,
          notes: notes || null
        });

      if (error) throw error;
      onCycleAdded();
    } catch (error) {
      console.error('Error adding cycle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Add Cycle</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (optional)</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cycleLength">Cycle Length (days)</Label>
                <Input
                  id="cycleLength"
                  name="cycleLength"
                  type="number"
                  // min="20"
                  min="5"
                  max="40"
                  placeholder="28"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="periodLength">Period Length (days)</Label>
                <Input
                  id="periodLength"
                  name="periodLength"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="5"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Symptoms</Label>
              <div className="grid grid-cols-2 gap-2">
                {commonSymptoms.map((symptom) => (
                  <div key={symptom} className="flex items-center space-x-2">
                    <Checkbox
                      id={symptom}
                      checked={selectedSymptoms.includes(symptom)}
                      onCheckedChange={() => toggleSymptom(symptom)}
                    />
                    <Label htmlFor={symptom} className="text-sm">
                      {symptom}
                    </Label>
                  </div>
                ))}
              </div>
              
              {selectedSymptoms.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedSymptoms.map((symptom) => (
                    <Badge key={symptom} variant="secondary" className="text-xs">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Any additional notes about this cycle..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Adding..." : "Add Cycle"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CycleForm;