import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../../amplify/data/resource';
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
  GlassButton,
  GlassInput,
  PageLoader,
} from '@/components/ui';
import { Settings, Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

const client = generateClient<Schema>();

interface ScreeningParameter {
  key: string;
  label: string;
  value: number;
  type: 'number' | 'percent' | 'currency';
  category: string;
  description: string;
  dbField: string;
}

const parameterDefinitions: Omit<ScreeningParameter, 'value'>[] = [
  { key: 'method1MinPrice', label: 'Min Price', type: 'currency', category: 'Method 1', description: 'Minimum stock price', dbField: 'method1MinPrice' },
  { key: 'method1MaxPrice', label: 'Max Price', type: 'currency', category: 'Method 1', description: 'Maximum stock price', dbField: 'method1MaxPrice' },
  { key: 'method1MinVolume', label: 'Min Avg Volume', type: 'number', category: 'Method 1', description: 'Minimum 30-day average volume', dbField: 'method1MinVolume' },
  { key: 'method1MinATRPercent', label: 'Min ATR %', type: 'percent', category: 'Method 1', description: 'Minimum ATR percentage for volatility', dbField: 'method1MinATRPercent' },
  { key: 'method1MaxSpread', label: 'Max Spread', type: 'percent', category: 'Method 1', description: 'Maximum bid-ask spread percentage', dbField: 'method1MaxSpread' },
  { key: 'method2MaxRiskPercent', label: 'Max Risk %', type: 'percent', category: 'Method 2 (Gate 4)', description: 'Maximum risk per trade', dbField: 'method2MaxRiskPercent' },
  { key: 'method2MaxVIX', label: 'Max VIX', type: 'number', category: 'Method 2 (Gate 4)', description: 'Maximum VIX level for trading', dbField: 'method2MaxVIX' },
  { key: 'method2MinSetupQuality', label: 'Min Setup Quality', type: 'number', category: 'Method 2 (Gate 4)', description: 'Minimum setup quality score (1-4)', dbField: 'method2MinSetupQuality' },
  { key: 'method2MinRiskReward', label: 'Min R:R Ratio', type: 'number', category: 'Method 2 (Gate 4)', description: 'Minimum risk/reward ratio', dbField: 'method2MinRiskReward' },
];

const defaultValues: Record<string, number> = {
  method1MinPrice: 2.5,
  method1MaxPrice: 500,
  method1MinVolume: 500000,
  method1MinATRPercent: 3,
  method1MaxSpread: 0.5,
  method2MaxRiskPercent: 1,
  method2MaxVIX: 30,
  method2MinSetupQuality: 2,
  method2MinRiskReward: 1.5,
};

export function ScreeningParametersPage() {
  const queryClient = useQueryClient();
  const [localValues, setLocalValues] = React.useState<Record<string, number>>({});
  const [hasChanges, setHasChanges] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const { data: dbParams, isLoading, error, refetch } = useQuery({
    queryKey: ['screening-parameters'],
    queryFn: async () => {
      const response = await client.models.ScreeningParameters.list();
      
      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to fetch parameters');
      }

      const data = response.data?.[0];
      return data || null;
    },
  });

  React.useEffect(() => {
    if (dbParams) {
      const values: Record<string, number> = {};
      parameterDefinitions.forEach(param => {
        const dbValue = (dbParams as Record<string, unknown>)[param.dbField];
        values[param.key] = typeof dbValue === 'number' ? dbValue : defaultValues[param.key];
      });
      setLocalValues(values);
    } else if (!isLoading) {
      setLocalValues(defaultValues);
    }
  }, [dbParams, isLoading]);

  const saveMutation = useMutation({
    mutationFn: async (values: Record<string, number>) => {
      const createData = {
        method1MinPrice: values.method1MinPrice,
        method1MaxPrice: values.method1MaxPrice,
        method1MinVolume: values.method1MinVolume,
        method1MinATRPercent: values.method1MinATRPercent,
        method1MaxSpread: values.method1MaxSpread,
        method2MaxRiskPercent: values.method2MaxRiskPercent,
        method2MaxVIX: values.method2MaxVIX,
        method2MinSetupQuality: String(values.method2MinSetupQuality),
        method2MinRiskReward: values.method2MinRiskReward,
        updatedBy: 'admin',
      };

      if (dbParams?.id) {
        const response = await client.models.ScreeningParameters.update({
          id: dbParams.id,
          ...createData,
        });
        if (response.errors) {
          throw new Error(response.errors[0]?.message || 'Failed to update parameters');
        }
        return response.data;
      } else {
        const response = await client.models.ScreeningParameters.create(createData);
        if (response.errors) {
          throw new Error(response.errors[0]?.message || 'Failed to create parameters');
        }
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screening-parameters'] });
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const handleChange = (key: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setLocalValues(prev => ({ ...prev, [key]: numValue }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = () => {
    saveMutation.mutate(localValues);
  };

  const handleReset = () => {
    setLocalValues(defaultValues);
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const groupedParameters = React.useMemo(() => {
    const groups: Record<string, ScreeningParameter[]> = {};
    parameterDefinitions.forEach(param => {
      const value = localValues[param.key] ?? defaultValues[param.key];
      const fullParam: ScreeningParameter = { ...param, value };
      if (!groups[param.category]) {
        groups[param.category] = [];
      }
      groups[param.category].push(fullParam);
    });
    return groups;
  }, [localValues]);

  if (isLoading) return <PageLoader message="Loading parameters..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Settings className="w-8 h-8 text-purple-400" />
            Screening Parameters
          </h1>
          <p className="text-slate-400">
            Configure AI screening thresholds and filters
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <div className="flex items-center gap-2 text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Unsaved changes</span>
            </div>
          )}
          {saveSuccess && (
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">Saved successfully</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <GlassCard className="border-red-500/30 bg-red-500/5">
          <GlassCardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 font-medium">Error Loading Parameters</p>
                <p className="text-sm text-red-400/80 mt-1">
                  {(error as Error).message}. Using default values.
                </p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      )}

      <GlassCard className="border-amber-500/30 bg-amber-500/5">
        <GlassCardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 font-medium">Caution</p>
              <p className="text-sm text-amber-400/80 mt-1">
                Changing these parameters will affect all screening results. Changes take effect on the next screening run.
              </p>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>

      {Object.entries(groupedParameters).map(([category, params]) => (
        <GlassCard key={category}>
          <GlassCardHeader>
            <GlassCardTitle>{category}</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {params.map((param) => (
                <div key={param.key}>
                  <label className="block text-sm font-medium text-white mb-1">
                    {param.label}
                  </label>
                  <div className="relative">
                    {param.type === 'currency' && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    )}
                    <GlassInput
                      type="number"
                      step={param.type === 'currency' || param.type === 'percent' ? '0.01' : '1'}
                      value={param.value}
                      onChange={(e) => handleChange(param.key, e.target.value)}
                      className={param.type === 'currency' ? 'pl-7' : ''}
                    />
                    {param.type === 'percent' && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{param.description}</p>
                </div>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>
      ))}

      <GlassCard>
        <GlassCardContent className="py-4">
          <div className="flex items-center justify-end gap-3">
            <GlassButton variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload
            </GlassButton>
            <GlassButton variant="outline" onClick={handleReset} disabled={!hasChanges && !dbParams}>
              Reset to Defaults
            </GlassButton>
            <GlassButton 
              variant="primary" 
              onClick={handleSave} 
              loading={saveMutation.isPending} 
              disabled={!hasChanges}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </GlassButton>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}

export default ScreeningParametersPage;
