'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Tipos para os dados
type OpportunityData = {
  category: string;
  count: number;
  value: number;
};

type StatusData = {
  name: string;
  value: number;
};

type TimelineData = {
  month: string;
  opportunities: number;
  value: number;
};

type PipelineData = {
  name: string;
  value: number;
};

// Cores do tema com dourado para destaque, combinando com o sistema de cores do projeto
const COLORS = {
  primary: '#F59E0B', // Dourado principal para destaque
  primaryDark: '#D97706', // Dourado escuro
  secondary: '#3B82F6', // Azul para secundário
  secondaryDark: '#2563EB',
  accent: '#10B981', // Verde para positivo
  accentDark: '#059669',
  muted: '#9CA3AF', // Cinza para neutro
  background: '#F3F4F6', // Fundo claro
  text: '#1F2937' // Texto escuro
};

interface DashboardChartsProps {
  opportunityData: OpportunityData[];
  statusData: StatusData[];
  timelineData: TimelineData[];
  pipelineData: PipelineData[];
}

export default function DashboardCharts({ 
  opportunityData, 
  statusData, 
  timelineData, 
  pipelineData 
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Gráfico de barras - Oportunidades por categoria */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Oportunidades por Categoria</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={opportunityData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="category" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.5rem'
                }} 
              />
              <Legend />
              <Bar
                dataKey="count"
                name="Quantidade"
                fill={COLORS.primary}
                radius={[4, 4, 0, 0]}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de pizza - Status das oportunidades */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Status das Oportunidades</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index === 0 ? COLORS.primary :
                      index === 1 ? COLORS.secondary :
                      COLORS.accent
                    }
                    animationDuration={1000}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} oportunidades`, 'Quantidade']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.5rem'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de área - Evolução de oportunidades */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Evolução de Oportunidades</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={timelineData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.5rem'
                }} 
              />
              <Area
                type="monotone"
                dataKey="opportunities"
                stroke={COLORS.primary}
                fillOpacity={1}
                fill="url(#colorUv)"
                name="Oportunidades"
                animationDuration={800}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de funnel - Pipeline de vendas */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Pipeline de Vendas</h3>
        <div className="h-80 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={pipelineData}
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" />
              <YAxis dataKey="name" type="category" stroke="#6B7280" width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.5rem'
                }} 
              />
              <Bar dataKey="value" name="Quantidade" radius={[0, 4, 4, 0]}>
                {pipelineData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index === 0 ? COLORS.primary :
                      index === 1 ? COLORS.secondary :
                      index === 2 ? COLORS.accent :
                      index === 3 ? COLORS.muted :
                      COLORS.primary
                    }
                    animationDuration={800}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}