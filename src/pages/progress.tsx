import '@site/src/chartGlobals';

import React, {
  useEffect,
  useState,
} from 'react';

import { ChartOptions } from 'chart.js/auto';
import clsx from 'clsx';
import { Chart } from 'react-chartjs-2';

import Head from '@docusaurus/Head';
import * as progressUtils from '@site/src/progressUtils';
import Layout from '@theme/Layout';

import styles from './progress.module.css';

function InfoRow({ title, value, secondLevel = false }) {
  return (
    <p className={clsx(styles.infoRow, secondLevel && styles.secondLevel)}>
      <span className="key">{secondLevel && "- "}{title}</span>{" "}
      <span className="value">{value}</span>
    </p>
  );
}

function formatPercent(x: number, digits = 3) {
  return (100 * x).toFixed(digits) + "%";
}

function formatProgress(category: number, total: number) {
  return `${formatPercent(category / total)}`;
}

function formatSizeAsMb(sizeBytes: number, digits = 3) {
  return (sizeBytes / 1_000_000).toFixed(digits);
}

export default function Progress() {
  const [decompiled, setDecompiled] = useState("?.???/??.??? MB - ??.???%");

  const [entries, setEntries] = useState<progressUtils.Entry[]>([]);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    async function load() {
      const entries = await progressUtils.loadEntries();
      setEntries(entries);

      const last = entries[0];

      setDecompiled(`${last.decompiled}/${last.total} KB - ${formatProgress(last.decompiled, last.total)}`);

      setChartData({
        datasets: [
          {
            label: "Decompiled size%",
            data: entries.map(entry => {
              return {
                x: entry.time,
                y: entry.decompiled / entry.total,
              };
            }),
            pointRadius: 0,
            pointHoverRadius: 0,
            pointBackgroundColor: "#20adff",
            borderColor: "#20adff",
            cubicInterpolationMode: "monotone",
          },
        ],
      });
    }

    load();
  }, []);

  const chartOptions: ChartOptions = {
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        title: { display: false, text: "Date" },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 12,
        },
      },
      y: {
        title: { display: true, text: "Decompiled %" },
        beginAtZero: true,
        ticks: {
          callback: (value: number, _index: any, _values: any) => formatPercent(value, 2),
        },
      },
    },
    hover: {
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        position: "nearest",
        callbacks: {
          label: (item) => {
            const entry = entries[item.dataIndex];
            const lines = [];
            lines.push("Decompiled %: " + formatProgress(entry.decompiled, entry.total));
            if (item.datasetIndex == 1)
              return lines;
            lines.push(`Decompiled size: ${entry.decompiled} bytes`);
            // lines.push("Commit: " + entry.rev);
            lines.push("Commit: SOON")
            return lines;
          },
        },
        displayColors: false,
        borderColor: "#fff",
        borderWidth: 1,
      },
    },
  };

  return (
    <Layout noFooter title="Progress" description="Current progress of the Breath of the Wild decompilation project">
      <Head>
        <html className={clsx("container-botw-background")} id={styles.page} />
      </Head>
      <div className={styles.container}>
        <h1>Decompilation Progress</h1>
        <InfoRow title="Decompiled" value={decompiled} />
        <div
          className="chart-container"
          style={{ marginTop: 30, minHeight: 300 }}
        >
          {chartData && <Chart
            aria-label="Decompilation progress chart"
            role="img"
            type="line"
            data={chartData}
            options={chartOptions}
          />}
        </div>
      </div>
    </Layout>
  );
}
