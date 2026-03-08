import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { DollarSign, Save } from 'lucide-react';

interface CurrencyRate {
  id: string;
  currency_code: string;
  currency_name: string;
  symbol: string;
  rate: number;
}

const CurrencyRatesManager = () => {
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [editing, setEditing] = useState<Record<string, number>>({});

  const fetchRates = async () => {
    const { data } = await supabase.from('currency_rates').select('*').order('currency_code');
    if (data) {
      setRates(data as CurrencyRate[]);
      const editMap: Record<string, number> = {};
      data.forEach((r: any) => { editMap[r.id] = r.rate; });
      setEditing(editMap);
    }
  };

  useEffect(() => { fetchRates(); }, []);

  const saveRate = async (id: string) => {
    const newRate = editing[id];
    if (newRate <= 0) { toast({ title: 'Rate must be positive', variant: 'destructive' }); return; }
    const { error } = await supabase.from('currency_rates').update({ rate: newRate, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Rate updated!' });
    fetchRates();
  };

  return (
    <Card className="p-6 mb-8">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><DollarSign size={20} /> Currency Rates</h2>
      <p className="text-sm text-muted-foreground mb-4">All product prices are stored in USD. Set conversion rates below.</p>
      <div className="space-y-3">
        {rates.map(r => (
          <div key={r.id} className="flex items-center gap-3 border rounded-lg p-3">
            <div className="w-16 text-center font-bold text-lg">{r.symbol}</div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">{r.currency_name} ({r.currency_code})</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">1 USD =</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0.001"
                  value={editing[r.id] ?? r.rate}
                  onChange={e => setEditing(prev => ({ ...prev, [r.id]: parseFloat(e.target.value) || 0 }))}
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">{r.currency_code}</span>
                <Button size="sm" onClick={() => saveRate(r.id)}><Save className="h-3 w-3" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CurrencyRatesManager;
