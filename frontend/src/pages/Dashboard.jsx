import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL, getAuthHeaders } from "../services/api";
import { calcularMediaNotas, calcularRecordesPorArea } from "../utils/dashboardMetrics";
import MetricasGrid from "../components/dashboard/MetricasGrid";
import RecordesPorArea from "../components/dashboard/RecordesPorArea";
import DiagnosticoIA from "../components/dashboard/DiagnosticoIA";
import HistoricoList from "../components/dashboard/HistoricoList";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [openFeedbackId, setOpenFeedbackId] = useState(null);

  // Análise Geral com IA
  const [analiseIA, setAnaliseIA] = useState("");
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [erroIA, setErroIA] = useState("");

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const res = await fetch(`${API_URL}/simulado/historico`, {
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.erro || "Falha ao carregar histórico.");
        setHistorico(data.simulados || []);
      } catch (err) {
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorico();
  }, []);

  const handleGerarAnaliseIA = async () => {
    setCarregandoIA(true);
    setErroIA("");

    try {
      const res = await fetch(`${API_URL}/simulado/analise-historico`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || data.detalhe || "Erro ao consultar a IA.");

      setAnaliseIA(data.temHistorico === false ? data.mensagem : data.analiseIA);
    } catch (err) {
      setErroIA(err.message);
    } finally {
      setCarregandoIA(false);
    }
  };

  const toggleFeedback = (id) => {
    setOpenFeedbackId(prev => (prev === id ? null : id));
  };

  const totalSimulados = historico.length;
  const melhorNota = historico.length > 0
    ? Math.max(...historico.map(s => s.notaPonderada || 0)).toFixed(1)
    : "—";

  const mediaNotas = useMemo(
    () => calcularMediaNotas(historico, user?.pesos),
    [historico, user?.pesos]
  );

  const melhoresPorArea = useMemo(
    () => calcularRecordesPorArea(historico),
    [historico]
  );

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Desempenho & TRI</h1>
        <p className={styles.subtitle}>
          Relatório de avaliações concluídas e estimativas de pontuação por área.
        </p>
      </div>

      <MetricasGrid 
        totalSimulados={totalSimulados}
        melhorNota={melhorNota}
        mediaNotas={mediaNotas}
      />

      <RecordesPorArea melhoresPorArea={melhoresPorArea} />

      <DiagnosticoIA
        analiseIA={analiseIA}
        carregandoIA={carregandoIA}
        erroIA={erroIA}
        totalSimulados={totalSimulados}
        onGerarAnalise={handleGerarAnaliseIA}
      />

      <HistoricoList
        historico={historico}
        loading={loading}
        erro={erro}
        openFeedbackId={openFeedbackId}
        onToggleFeedback={toggleFeedback}
      />
    </div>
  );
};

export default Dashboard;
