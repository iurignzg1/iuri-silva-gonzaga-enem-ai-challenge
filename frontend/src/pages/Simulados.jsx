import { useState } from "react";
import { API_URL, getAuthHeaders } from "../services/api";
import SimuladoConfig from "../components/simulado/SimuladoConfig";
import SimuladoExame from "../components/simulado/SimuladoExame";
import SimuladoResultado from "../components/simulado/SimuladoResultado";

const Simulados = () => {
  const [dia, setDia] = useState(1);
  const [ano, setAno] = useState(2023);
  const [lingua, setLingua] = useState("ingles");

  const [iniciado, setIniciado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [questoes, setQuestoes] = useState([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [erro, setErro] = useState("");

  const [resultado, setResultado] = useState(null);
  const [finalizando, setFinalizando] = useState(false);

  const handleIniciar = async () => {
    setCarregando(true);
    setErro("");
    try {
      const url = `${API_URL}/simulado/${dia}?ano=${ano}${dia === 1 ? `&lingua=${lingua}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) throw new Error(data.erro || "Falha ao carregar exame.");
      if (!data.questoes || data.questoes.length === 0) {
        throw new Error("Nenhuma questão encontrada para os parâmetros informados.");
      }

      setQuestoes(data.questoes);
      setRespostas({});
      setIndiceAtual(0);
      setIniciado(true);
      setResultado(null);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleSelectAlternativa = (indexQuestao, letra) => {
    setRespostas(prev => ({ ...prev, [indexQuestao]: letra }));
  };

  const handleFinalizar = async () => {
    if (Object.keys(respostas).length === 0) {
      if (!confirm("Você ainda não selecionou nenhuma resposta. Deseja finalizar mesmo assim?")) return;
    }

    setFinalizando(true);
    setErro("");

    try {
      const res = await fetch(`${API_URL}/simulado/finalizar`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ ano, dia, lingua, respostas })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || data.detalhe || "Erro ao processar respostas.");

      setResultado(data);
      setIniciado(false);
    } catch (err) {
      setErro(err.message);
    } finally {
      setFinalizando(false);
    }
  };

  if (resultado) {
    return (
      <SimuladoResultado 
        resultado={resultado} 
        onReiniciar={() => setResultado(null)} 
      />
    );
  }

  if (iniciado && questoes.length > 0) {
    return (
      <SimuladoExame
        questoes={questoes}
        indiceAtual={indiceAtual}
        setIndiceAtual={setIndiceAtual}
        respostas={respostas}
        onSelectAlternativa={handleSelectAlternativa}
        onFinalizar={handleFinalizar}
        finalizando={finalizando}
      />
    );
  }

  return (
    <SimuladoConfig
      dia={dia}
      setDia={setDia}
      ano={ano}
      setAno={setAno}
      lingua={lingua}
      setLingua={setLingua}
      carregando={carregando}
      erro={erro}
      onIniciar={handleIniciar}
    />
  );
};

export default Simulados;
