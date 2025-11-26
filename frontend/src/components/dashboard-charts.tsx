'use client';

import React, { useEffect, useRef } from 'react';

// Tipos para os dados
type OpportunityData = {
  category: string;
  count: number;
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

interface DashboardChartsProps {
  opportunityData: OpportunityData[]; // category,count,value
  topProducts: { name: string; price: number }[]; // top 5 products
  timelineData: TimelineData[]; // month, opportunities, value (revenue)
  pipelineData: PipelineData[];
  conversionRateData?: { stage: string; conversionRate: number }[]; // Novo tipo para taxa de conversão
  avgValueByCategoryData?: { category: string; avgValue: number }[]; // Novo tipo para valor médio por categoria
  valueDistributionData?: { range: string; count: number }[]; // Novo tipo para distribuição de valor
  topSellingProductsData?: { name: string; sold: number; revenue: number }[]; // Novo tipo para produtos mais vendidos
}

export default function DashboardCharts({
  opportunityData,
  topProducts,
  timelineData,
  pipelineData,
  conversionRateData = [],
  avgValueByCategoryData = [],
  valueDistributionData = [],
  topSellingProductsData = []
}: DashboardChartsProps) {
  const conversionRateRef = useRef<HTMLDivElement>(null);
  const avgValueByCategoryRef = useRef<HTMLDivElement>(null);
  const valueDistributionRef = useRef<HTMLDivElement>(null);
  const topSellingProductsRef = useRef<HTMLDivElement>(null);
  const opportunityCategoryRef = useRef<HTMLDivElement>(null);
  const topProductsRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const pipelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Carregar o Google Charts com proteção: carregamos o loader se necessário
    const loadGoogleCharts = async () => {
      if (typeof window === 'undefined') return

      // Ensure `google.charts` is loaded. If not, inject the official loader and wait.
      const ensureGoogleCharts = async () => {
        const win = window as any
        if (win.google && win.google.visualization && win.google.charts) return win.google

        // If loader already present but not loaded, call load
        if (win.google && win.google.charts && win.google.charts.load) {
          return await new Promise((resolve, reject) => {
            try {
              win.google.charts.load('current', { packages: ['corechart', 'bar'] })
              win.google.charts.setOnLoadCallback(() => resolve(win.google))
            } catch (e) {
              reject(e)
            }
          })
        }

        // Inject loader script
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector('script[src="https://www.gstatic.com/charts/loader.js"]')
          if (existing) {
            // Wait a short while for google to initialize
            const check = () => {
              const w = (window as any)
              if (w.google && w.google.visualization && w.google.charts) resolve()
              else setTimeout(check, 50)
            }
            check()
            return
          }

          const script = document.createElement('script')
          script.src = 'https://www.gstatic.com/charts/loader.js'
          script.async = true
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load google charts loader'))
          document.head.appendChild(script)
        })

        // now load packages
        const win2 = window as any
        return await new Promise((resolve, reject) => {
          try {
            win2.google.charts.load('current', { packages: ['corechart', 'bar'] })
            win2.google.charts.setOnLoadCallback(() => resolve(win2.google))
          } catch (e) {
            reject(e)
          }
        })
      }

      let google: any
      try {
        google = await ensureGoogleCharts()
      } catch (err) {
        console.error('Failed to initialize Google Charts', err)
        return
      }

        // Gráfico de Taxa de Conversão por Estágio do Funil
        if (conversionRateData && conversionRateData.length > 0 && conversionRateRef.current) {
          // guard: ensure DataTable exists
          if (!google || !google.visualization || !google.visualization.DataTable) {
            console.warn('Google visualization DataTable not available — skipping conversionRate chart')
          } else {
            const data = new google.visualization.DataTable();
          data.addColumn('string', 'Estágio');
          data.addColumn('number', 'Taxa de Conversão (%)');

          conversionRateData.forEach(item => {
            data.addRow([item.stage, item.conversionRate]);
          });

          const options = {
            title: 'Taxa de Conversão por Estágio do Funil',
            titleTextStyle: {
              fontSize: 16,
              bold: true
            },
            hAxis: {
              title: 'Taxa de Conversão (%)',
              minValue: 0,
              maxValue: 100,
              format: '#%'
            },
            vAxis: {
              title: 'Estágio'
            },
            backgroundColor: '#ffffff',
            legend: { position: 'none' },
            bar: { groupWidth: '80%' },
            colors: ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6'],
            animation: {
              startup: true,
              duration: 1000,
              easing: 'out'
            },
            tooltip: {
              trigger: 'both',
              isHtml: true
            }
          };

            const chart = new google.visualization.BarChart(conversionRateRef.current);
            chart.draw(data, options);
          }
        }

        // Gráfico de Valor Médio por Oportunidade por Categoria
        if (avgValueByCategoryData && avgValueByCategoryData.length > 0 && avgValueByCategoryRef.current) {
          if (!google || !google.visualization || !google.visualization.DataTable) {
            console.warn('Google visualization DataTable not available — skipping avgValueByCategory chart')
          } else {
            const data = new google.visualization.DataTable();
          data.addColumn('string', 'Categoria');
          data.addColumn('number', 'Valor Médio (R$)');

          avgValueByCategoryData.forEach(item => {
            data.addRow([item.category, item.avgValue]);
          });

          const options = {
            title: 'Valor Médio por Oportunidade por Categoria',
            titleTextStyle: {
              fontSize: 16,
              bold: true
            },
            hAxis: {
              title: 'Valor Médio (R$)',
              format: 'R$ #,###.##'
            },
            vAxis: {
              title: 'Categoria'
            },
            backgroundColor: '#ffffff',
            legend: { position: 'none' },
            bar: { groupWidth: '80%' },
            colors: ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'],
            animation: {
              startup: true,
              duration: 1000,
              easing: 'out'
            },
            tooltip: {
              trigger: 'both',
              isHtml: true
            }
          };

          const chart = new google.visualization.BarChart(avgValueByCategoryRef.current);
          chart.draw(data, options);
        }

        // Gráfico de Distribuição de Oportunidades por Valor
        if (valueDistributionData && valueDistributionData.length > 0 && valueDistributionRef.current) {
          const data = new google.visualization.DataTable();
          data.addColumn('string', 'Faixa de Valor');
          data.addColumn('number', 'Quantidade');

          valueDistributionData.forEach(item => {
            data.addRow([item.range, item.count]);
          });

          const options = {
            title: 'Distribuição de Oportunidades por Valor',
            titleTextStyle: {
              fontSize: 16,
              bold: true
            },
            hAxis: {
              title: 'Faixa de Valor'
            },
            vAxis: {
              title: 'Quantidade'
            },
            backgroundColor: '#ffffff',
            legend: { position: 'none' },
            bar: { groupWidth: '80%' },
            colors: ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B'],
            animation: {
              startup: true,
              duration: 1000,
              easing: 'out'
            },
            tooltip: {
              trigger: 'both',
              isHtml: true
            }
          };

            const chart = new google.visualization.ColumnChart(valueDistributionRef.current);
            chart.draw(data, options);
          }
        }

        // Gráfico de Produtos Mais Vendidos
        if (topSellingProductsData && topSellingProductsData.length > 0 && topSellingProductsRef.current) {
          if (!google || !google.visualization || !google.visualization.DataTable) {
            console.warn('Google visualization DataTable not available — skipping topSellingProducts chart')
          } else {
            const data = new google.visualization.DataTable();
          data.addColumn('string', 'Produto');
          data.addColumn('number', 'Quantidade Vendida');
          data.addColumn({type: 'number', role: 'tooltip', p: {html: true}});

          topSellingProductsData.forEach(item => {
            const tooltip = `<div style="padding: 10px;">
                              <b>${item.name}</b><br>
                              Quantidade: ${item.sold}<br>
                              Receita: R$ ${item.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                             </div>`;
            data.addRow([item.name, item.sold, tooltip]);
          });

          const options = {
            title: 'Produtos Mais Vendidos',
            titleTextStyle: {
              fontSize: 16,
              bold: true
            },
            hAxis: {
              title: 'Quantidade Vendida'
            },
            vAxis: {
              title: 'Produto'
            },
            backgroundColor: '#ffffff',
            legend: { position: 'none' },
            bar: { groupWidth: '80%' },
            colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
            animation: {
              startup: true,
              duration: 1000,
              easing: 'out'
            },
            tooltip: {
              trigger: 'both',
              isHtml: true
            }
          };

            const chart = new google.visualization.BarChart(topSellingProductsRef.current);
            chart.draw(data, options);
          }
        }

        // Gráfico de Pizza - Oportunidades por Categoria
        if (opportunityData && opportunityData.length > 0 && opportunityCategoryRef.current) {
          if (!google || !google.visualization || !google.visualization.DataTable) {
            console.warn('Google visualization DataTable not available — skipping opportunity category pie chart')
          } else {
            const data = new google.visualization.DataTable();
          data.addColumn('string', 'Categoria');
          data.addColumn('number', 'Quantidade');

          opportunityData.forEach(item => {
            data.addRow([item.category, item.count]);
          });

          const options = {
            title: 'Oportunidades por Categoria',
            titleTextStyle: {
              fontSize: 16,
              bold: true
            },
            backgroundColor: '#ffffff',
            is3D: true,
            colors: ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6'],
            animation: {
              startup: true,
              duration: 1000,
              easing: 'out'
            },
            tooltip: {
              trigger: 'both',
              isHtml: true
            }
          };

            const chart = new google.visualization.PieChart(opportunityCategoryRef.current);
            chart.draw(data, options);
          }
        }

        // Gráfico de Barras Horizontal - Top 5 produtos mais caros
        if (topProducts && topProducts.length > 0 && topProductsRef.current) {
          if (!google || !google.visualization || !google.visualization.DataTable) {
            console.warn('Google visualization DataTable not available — skipping topProducts chart')
          } else {
            const data = new google.visualization.DataTable();
          data.addColumn('string', 'Produto');
          data.addColumn('number', 'Preço (R$)');

          topProducts.forEach(item => {
            data.addRow([item.name, item.price]);
          });

          const options = {
            title: 'Top 5 produtos mais caros',
            titleTextStyle: {
              fontSize: 16,
              bold: true
            },
            hAxis: {
              title: 'Preço (R$)',
              format: 'R$ #,###.##'
            },
            vAxis: {
              title: 'Produto'
            },
            backgroundColor: '#ffffff',
            legend: { position: 'none' },
            bar: { groupWidth: '80%' },
            colors: ['#F59E0B', '#D97706', '#FBBF24', '#FCD34D', '#FDE68A'],
            animation: {
              startup: true,
              duration: 1000,
              easing: 'out'
            },
            tooltip: {
              trigger: 'both',
              isHtml: true
            }
          };

            const chart = new google.visualization.BarChart(topProductsRef.current);
            chart.draw(data, options);
          }
        }

        // Gráfico de Linhas - Evolução no Faturamento
        if (timelineData && timelineData.length > 0 && timelineRef.current) {
          if (!google || !google.visualization || !google.visualization.DataTable) {
            console.warn('Google visualization DataTable not available — skipping timeline chart')
          } else {
            const data = new google.visualization.DataTable();
          data.addColumn('string', 'Mês');
          data.addColumn('number', 'Faturamento (R$)');
          data.addColumn('number', 'Oportunidades');

          timelineData.forEach(item => {
            data.addRow([item.month, item.value, item.opportunities]);
          });

          const options = {
            title: 'Evolução no Faturamento',
            titleTextStyle: {
              fontSize: 16,
              bold: true
            },
            hAxis: {
              title: 'Mês'
            },
            vAxis: {
              title: 'Valor (R$)',
              format: 'R$ #,###.##'
            },
            backgroundColor: '#ffffff',
            legend: { position: 'top' },
            colors: ['#F59E0B', '#3B82F6'],
            animation: {
              startup: true,
              duration: 1000,
              easing: 'out'
            },
            tooltip: {
              trigger: 'both',
              isHtml: true
            },
            pointSize: 5,
            lineWidth: 3
          };

            const chart = new google.visualization.LineChart(timelineRef.current);
            chart.draw(data, options);
          }
        }

        // Gráfico de Funil - Pipeline de Vendas
        if (pipelineData && pipelineData.length > 0 && pipelineRef.current) {
          if (!google || !google.visualization || !google.visualization.DataTable) {
            console.warn('Google visualization DataTable not available — skipping pipeline chart')
          } else {
            const data = new google.visualization.DataTable();
            data.addColumn('string', 'Estágio');
            data.addColumn('number', 'Quantidade');

            pipelineData.forEach(item => {
              data.addRow([item.name, item.value]);
            });

            const options = {
              title: 'Pipeline de Vendas',
              titleTextStyle: {
                fontSize: 16,
                bold: true
              },
              backgroundColor: '#ffffff',
              legend: { position: 'none' },
              colors: ['#3B82F6', '#1D4ED8', '#60A5FA', '#93C5FD', '#BFDBFE'],
              animation: {
                startup: true,
                duration: 1000,
                easing: 'out'
              },
              tooltip: {
                trigger: 'both',
                isHtml: true
              }
            };

            const chart = new google.visualization.BarChart(pipelineRef.current);
            chart.draw(data, options);
          }
        }
    }

    loadGoogleCharts();
  }, [opportunityData, topProducts, timelineData, pipelineData, conversionRateData, avgValueByCategoryData, valueDistributionData, topSellingProductsData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Gráfico de Taxa de Conversão por Estágio do Funil */}
      <div className="bg-white p-6 rounded-lg border overflow-visible">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold mb-4 flex-grow">Taxa de Conversão por Estágio do Funil</h3>
          <div className="tooltip-group relative">
            <div className="tooltip-trigger cursor-help text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="tooltip-content absolute z-10 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2">
              Mostra a porcentagem de oportunidades que avançam de um estágio para o próximo no funil de vendas
            </div>
          </div>
        </div>
        <div ref={conversionRateRef} className="h-80"></div>
      </div>

      {/* Gráfico de Valor Médio por Oportunidade por Categoria */}
      <div className="bg-white p-6 rounded-lg border overflow-visible">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold mb-4 flex-grow">Valor Médio por Oportunidade por Categoria</h3>
          <div className="tooltip-group relative">
            <div className="tooltip-trigger cursor-help text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="tooltip-content absolute z-10 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2">
              Mostra o valor médio das oportunidades em cada categoria, ajudando a identificar quais categorias geram oportunidades mais valiosas
            </div>
          </div>
        </div>
        <div ref={avgValueByCategoryRef} className="h-80"></div>
      </div>

      {/* Gráfico de Distribuição de Oportunidades por Valor */}
      <div className="bg-white p-6 rounded-lg border overflow-visible">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold mb-4 flex-grow">Distribuição de Oportunidades por Valor</h3>
          <div className="tooltip-group relative">
            <div className="tooltip-trigger cursor-help text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="tooltip-content absolute z-10 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2">
              Mostra como as oportunidades estão distribuídas em diferentes faixas de valor, ajudando a entender o perfil dos negócios
            </div>
          </div>
        </div>
        <div ref={valueDistributionRef} className="h-80"></div>
      </div>

      {/* Gráfico de Produtos Mais Vendidos */}
      <div className="bg-white p-6 rounded-lg border overflow-visible">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold mb-4 flex-grow">Produtos Mais Vendidos</h3>
          <div className="tooltip-group relative">
            <div className="tooltip-trigger cursor-help text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="tooltip-content absolute z-10 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2">
              Mostra os produtos mais vendidos em termos de quantidade, ajudando a identificar os produtos de maior sucesso
            </div>
          </div>
        </div>
        <div ref={topSellingProductsRef} className="h-80"></div>
      </div>

      {/* Gráfico de pizza - Oportunidades por categoria */}
      <div className="bg-white p-6 rounded-lg border overflow-visible">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold mb-4 flex-grow">Oportunidades por Categoria</h3>
          <div className="tooltip-group relative">
            <div className="tooltip-trigger cursor-help text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="tooltip-content absolute z-10 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2">
              Distribuição percentual das oportunidades por categoria
            </div>
          </div>
        </div>
        <div ref={opportunityCategoryRef} className="h-80"></div>
      </div>

      {/* Top 5 produtos mais caros */}
      <div className="bg-white p-6 rounded-lg border overflow-visible">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold mb-4 flex-grow">Top 5 produtos mais caros</h3>
          <div className="tooltip-group relative">
            <div className="tooltip-trigger cursor-help text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="tooltip-content absolute z-10 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2">
              Lista os 5 produtos com os valores mais altos
            </div>
          </div>
        </div>
        <div ref={topProductsRef} className="h-80"></div>
      </div>

      {/* Gráfico de linhas - Evolução no Faturamento */}
      <div className="bg-white p-6 rounded-lg border overflow-visible">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold mb-4 flex-grow">Evolução no Faturamento</h3>
          <div className="tooltip-group relative">
            <div className="tooltip-trigger cursor-help text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="tooltip-content absolute z-10 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2">
              Mostra a evolução do faturamento e número de oportunidades ao longo do tempo
            </div>
          </div>
        </div>
        <div ref={timelineRef} className="h-80"></div>
      </div>

      {/* Gráfico de funnel - Pipeline de vendas */}
      <div className="bg-white p-6 rounded-lg border overflow-visible">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold mb-4 flex-grow">Pipeline de Vendas</h3>
          <div className="tooltip-group relative">
            <div className="tooltip-trigger cursor-help text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="tooltip-content absolute z-10 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2">
              Representa visualmente as etapas do funil de vendas e quantas oportunidades estão em cada estágio
            </div>
          </div>
        </div>
        <div ref={pipelineRef} className="h-80"></div>
      </div>
    </div>
  );
}