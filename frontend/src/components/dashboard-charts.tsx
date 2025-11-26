'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart,
  Line,
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
  opportunityData: OpportunityData[]; // category,count,value
  topProducts: { name: string; price: number }[]; // top 5 products
  timelineData: TimelineData[]; // month, opportunities, value (revenue)
  pipelineData: PipelineData[];
}

export default function DashboardCharts({ 
  opportunityData,
  topProducts,
  timelineData, 
  pipelineData 
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Gráfico de pizza - Oportunidades por categoria */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Oportunidades por Categoria</h3>
        <div className="h-80 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={opportunityData}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {opportunityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={
                    index === 0 ? COLORS.primary :
                    index === 1 ? COLORS.secondary :
                    index === 2 ? COLORS.accent : COLORS.muted
                  } />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} oportunidades`, 'Quantidade']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 5 produtos mais caros */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Top 5 produtos mais caros</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topProducts}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" tickFormatter={(val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val))} />
              <YAxis type="category" dataKey="name" stroke="#6B7280" width={180} />
              <Tooltip 
                formatter={(value) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value)), 'Preço']} 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}
              />
              <Bar dataKey="price" name="Preço" fill={COLORS.primaryDark} radius={[4, 4, 4, 4]}>
                {topProducts.map((entry, index) => (
                  <Cell key={`cell-price-${index}`} fill={index % 2 === 0 ? COLORS.primary : COLORS.secondary} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de linhas - Evolução no Faturamento */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Evolução no Faturamento</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" tickFormatter={(v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)} />
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} formatter={(v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v))} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke={COLORS.primary} strokeWidth={2.5} dot={{ r: 4, fill: COLORS.primaryDark }} activeDot={{ r: 6 }} name="Faturamento" />
              <Line type="monotone" dataKey="opportunities" stroke={COLORS.secondary} strokeWidth={1.6} dot={false} name="Oportunidades" />
            </LineChart>
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