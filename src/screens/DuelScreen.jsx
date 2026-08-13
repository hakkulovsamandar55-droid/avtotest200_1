import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Swords, Trophy, Frown, Handshake, Users, Shuffle, Send, Copy, Check } from "lucide-react";
import { getDuelSocket, disconnectDuelSocket } from "../duelSocket";
import QuestionImage from "../components/QuestionImage";
import { QuizShell, QuizHeader, QuizProgress, OptionButton, QuizButton } from "../components/exam/QuizUI";
import { QUIZ } from "../quizTheme";

// Duel (jonli musobaqa) rejimi — real vaqtda ikkita foydalanuvchi bir xil
// 20 ta savolni yechadi. Server savollarni va to'g'ri javoblarni saqlaydi,
// shuning uchun bu yerda darhol "to'g'ri/xato" ko'rsatilmaydi — natija faqat
// duel tugagach ma'lum bo'ladi (bu duel uslubiga xos, TestScreen'dan farqli).
//
// Raqib topish ikki yo'l bilan bo'lishi mumkin:
//   - "random"  — umumiy navbatga qo'shilib, birinchi bo'sh raqibga ulanadi
//   - "lobby"   — o'zi lobby ochadi (6 xonali kod), do'stini Telegram orqali
//                 yoki kodni qo'lda yuborib taklif qiladi
export default function DuelScreen({ onExit }) {
  const { t } = useTranslation();
  // idle | mode_select | searching | lobby_host | lobby_join | playing | finished
  const [phase, setPhase] = useState("idle");
  const [duelId, setDuelId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [opponentName, setOpponentName] = useState("");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [myAnswered, setMyAnswered] = useState(0);
  const [opponentAnswered, setOpponentAnswered] = useState(0);
  const [opponentFinished, setOpponentFinished] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [onlineCount, setOnlineCount] = useState(null);

  const [lobbyCode, setLobbyCode] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState(null);
  const [copied, setCopied] = useState(false);

  const socketRef = useRef(null);

  useEffect(() => {
    const socket = getDuelSocket();
    socketRef.current = socket;
    socket.connect();

    socket.on("connect_error", () => {
      setError(t("duel.connectionError"));
      setPhase("idle");
    });
    socket.on("duel:queued", () => setPhase("searching"));
    socket.on("duel:online_count", ({ count }) => setOnlineCount(count));

    socket.on("duel:lobby_created", ({ code }) => {
      setLobbyCode(code);
      setPhase("lobby_host");
    });
    socket.on("duel:lobby_expired", () => {
      setLobbyCode(null);
      setError(t("duel.lobbyExpired"));
      setPhase("mode_select");
    });
    socket.on("duel:lobby_error", ({ reason }) => {
      setJoinError(
        reason === "self"
          ? t("duel.lobbyErrorSelf")
          : reason === "unavailable"
          ? t("duel.lobbyErrorUnavailable")
          : t("duel.lobbyErrorNotFound")
      );
    });

    socket.on("duel:start", (payload) => {
      setDuelId(payload.duelId);
      setQuestions(payload.questions);
      setOpponentName(payload.opponent.name);
      setIndex(0);
      setSelected(null);
      setMyAnswered(0);
      setOpponentAnswered(0);
      setOpponentFinished(false);
      setLobbyCode(null);
      setJoinError(null);
      setPhase("playing");
    });
    socket.on("duel:opponent_progress", ({ answered }) => setOpponentAnswered(answered));
    socket.on("duel:opponent_finished", () => setOpponentFinished(true));
    socket.on("duel:result", (payload) => {
      setResult(payload);
      setPhase("finished");
    });

    return () => {
      socket.off("connect_error");
      socket.off("duel:queued");
      socket.off("duel:online_count");
      socket.off("duel:lobby_created");
      socket.off("duel:lobby_expired");
      socket.off("duel:lobby_error");
      socket.off("duel:start");
      socket.off("duel:opponent_progress");
      socket.off("duel:opponent_finished");
      socket.off("duel:result");
      disconnectDuelSocket();
    };
  }, [t]);

  function openModeSelect() {
    setError(null);
    setPhase("mode_select");
  }

  function startSearching() {
    setError(null);
    socketRef.current?.emit("duel:join_queue");
    setPhase("searching");
  }

  function cancelSearching() {
    socketRef.current?.emit("duel:leave_queue");
    setPhase("mode_select");
  }

  function createLobby() {
    setError(null);
    socketRef.current?.emit("duel:create_lobby");
  }

  function cancelLobby() {
    socketRef.current?.emit("duel:cancel_lobby");
    setLobbyCode(null);
    setPhase("mode_select");
  }

  function openJoinLobby() {
    setJoinError(null);
    setJoinCode("");
    setPhase("lobby_join");
  }

  function submitJoinLobby() {
    if (joinCode.trim().length !== 6) {
      setJoinError(t("duel.lobbyErrorInvalid"));
      return;
    }
    setJoinError(null);
    socketRef.current?.emit("duel:join_lobby", { code: joinCode.trim() });
  }

  function copyLobbyCode() {
    if (!lobbyCode) return;
    navigator.clipboard?.writeText(lobbyCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function shareLobbyViaTelegram() {
    if (!lobbyCode) return;
    const botUsername = import.meta.env.VITE_BOT_USERNAME;
    const shareText = t("duel.shareText", { code: lobbyCode });
    const tg = window.Telegram?.WebApp;

    // MUHIM: referral havolasidagi bilan bir xil tuzatish — "?start="
    // (bot buyrug'i) o'rniga "?startapp=" (Telegramning rasmiy "Main
    // Mini App" havolasi) ishlatiladi, aks holda do'st bosgan havola
    // faqat bot chatini ochib, duelga bevosita kiritmaydi. Qisqa ilova
    // nomi shart emas — botning Menu Button/Main Mini App sifatida
    // sozlangan Web App'i shu bilan bevosita ochiladi.
    if (botUsername) {
      const startParam = `duel_${lobbyCode}`;
      const deepLink = `https://t.me/${botUsername}?startapp=${startParam}`;
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(deepLink)}&text=${encodeURIComponent(shareText)}`;
      if (tg?.openTelegramLink) {
        tg.openTelegramLink(shareUrl);
        return;
      }
      window.open(shareUrl, "_blank");
      return;
    }

    // Bot username sozlanmagan bo'lsa — kodni oddiy matn sifatida ulashamiz
    if (navigator.share) {
      navigator.share({ text: shareText }).catch(() => {});
    } else {
      copyLobbyCode();
    }
  }

  function handleChoose(optIdx) {
    if (selected !== null) return;
    setSelected(optIdx);
    socketRef.current?.emit("duel:answer", {
      duelId,
      questionIndex: index,
      chosenIndex: optIdx,
    });
    setMyAnswered((n) => n + 1);

    setTimeout(() => {
      if (index + 1 < questions.length) {
        setIndex((i) => i + 1);
        setSelected(null);
      }
      // Oxirgi savolda — "raqib tugatishini kutish" holati playing rejimida
      // opponentFinished/duel:result orqali avtomatik ko'rinadi.
    }, 250);
  }

  if (phase === "idle") {
    return (
      <QuizShell className="flex flex-col">
        <QuizHeader title={t("duel.title")} onBack={onExit} />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-accent">
            <Swords size={40} color={QUIZ.accentInk} />
          </div>
          <h2 className="text-xl font-extrabold mb-2">{t("duel.introTitle")}</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: QUIZ.muted }}>
            {t("duel.introSubtitle")}
          </p>
          {onlineCount !== null && (
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-6 border" style={{ background: QUIZ.successSoft, borderColor: "rgba(52,211,153,0.25)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: QUIZ.success }} />
              <span className="text-xs font-semibold" style={{ color: QUIZ.success }}>
                {t("duel.onlineCount", { count: onlineCount })}
              </span>
            </div>
          )}
          {error && (
            <p className="text-xs mb-4" style={{ color: QUIZ.danger }}>
              {error}
            </p>
          )}
          <QuizButton onClick={openModeSelect}>{t("duel.findOpponent")}</QuizButton>
        </div>
      </QuizShell>
    );
  }

  if (phase === "mode_select") {
    return (
      <QuizShell className="flex flex-col">
        <QuizHeader title={t("duel.title")} onBack={onExit} />
        <div className="flex-1 flex flex-col justify-center gap-4 px-1">
          {error && (
            <p className="text-xs text-center mb-1" style={{ color: QUIZ.danger }}>
              {error}
            </p>
          )}

          <button onClick={startSearching} className="w-full rounded-2xl p-5 flex items-center gap-4 text-left active:scale-[0.98] transition-transform bg-accent">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Shuffle size={22} color={QUIZ.accentInk} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-[15px]" style={{ color: QUIZ.accentInk }}>
                {t("duel.randomOpponent")}
              </p>
              <p className="text-xs mt-0.5 opacity-80" style={{ color: QUIZ.accentInk }}>
                {t("duel.randomOpponentSubtitle")}
              </p>
            </div>
          </button>

          <button
            onClick={createLobby}
            className="w-full rounded-2xl p-5 flex items-center gap-4 text-left border active:scale-[0.98] transition-transform"
            style={{ borderColor: QUIZ.border, background: QUIZ.card }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(251,191,36,0.15)" }}>
              <Users size={22} color={QUIZ.warning} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-[15px]">{t("duel.inviteFriend")}</p>
              <p className="text-xs mt-0.5" style={{ color: QUIZ.muted }}>
                {t("duel.inviteFriendSubtitle")}
              </p>
            </div>
          </button>

          <button onClick={openJoinLobby} className="w-full text-center text-sm py-2 active:opacity-70" style={{ color: QUIZ.muted }}>
            {t("duel.haveCode")}
          </button>
        </div>
      </QuizShell>
    );
  }

  if (phase === "lobby_host") {
    return (
      <QuizShell className="flex flex-col">
        <QuizHeader title={t("duel.title")} onBack={cancelLobby} />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: "rgba(251,191,36,0.15)" }}>
            <Users size={28} color={QUIZ.warning} />
          </div>
          <h2 className="text-lg font-bold mb-1">{t("duel.lobbyWaiting")}</h2>
          <p className="text-sm mb-6" style={{ color: QUIZ.muted }}>
            {t("duel.lobbyWaitingSubtitle")}
          </p>

          {lobbyCode ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-2">
                  {lobbyCode.split("").map((digit, i) => (
                    <span
                      key={i}
                      className="w-9 h-11 rounded-xl border flex items-center justify-center text-lg font-extrabold tracking-wide"
                      style={{ background: QUIZ.card, borderColor: QUIZ.border }}
                    >
                      {digit}
                    </span>
                  ))}
                </div>
                <button onClick={copyLobbyCode} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: QUIZ.card }}>
                  {copied ? <Check size={16} color={QUIZ.success} /> : <Copy size={16} color={QUIZ.text} />}
                </button>
              </div>

              <button
                onClick={shareLobbyViaTelegram}
                className="w-full rounded-2xl py-3.5 font-bold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mb-3"
                style={{ background: "#0EA5E9", color: "#fff" }}
              >
                <Send size={16} />
                {t("duel.shareViaTelegram")}
              </button>
            </>
          ) : (
            <div
              className="w-10 h-10 rounded-full border-4 animate-spin mb-6"
              style={{ borderColor: QUIZ.border, borderTopColor: QUIZ.accent }}
            />
          )}

          <QuizButton variant="secondary" onClick={cancelLobby} className="px-6 w-auto">
            {t("duel.cancel")}
          </QuizButton>
        </div>
      </QuizShell>
    );
  }

  if (phase === "lobby_join") {
    return (
      <QuizShell className="flex flex-col">
        <QuizHeader title={t("duel.title")} onBack={() => setPhase("mode_select")} />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: "rgba(251,191,36,0.15)" }}>
            <Users size={28} color={QUIZ.warning} />
          </div>
          <h2 className="text-lg font-bold mb-1">{t("duel.enterCode")}</h2>
          <p className="text-sm mb-6" style={{ color: QUIZ.muted }}>
            {t("duel.enterCodeSubtitle")}
          </p>

          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            placeholder="000000"
            className="w-full text-center text-2xl font-extrabold tracking-[0.3em] rounded-2xl py-3.5 mb-4"
            style={{ background: QUIZ.card, border: `1px solid ${QUIZ.border}`, color: QUIZ.text }}
          />

          {joinError && (
            <p className="text-xs mb-4" style={{ color: QUIZ.danger }}>
              {joinError}
            </p>
          )}

          <QuizButton onClick={submitJoinLobby} className="mb-3">
            {t("duel.joinLobby")}
          </QuizButton>
          <QuizButton variant="secondary" onClick={() => setPhase("mode_select")} className="px-6 w-auto">
            {t("duel.cancel")}
          </QuizButton>
        </div>
      </QuizShell>
    );
  }

  if (phase === "searching") {
    return (
      <QuizShell className="flex flex-col">
        <QuizHeader title={t("duel.title")} onBack={cancelSearching} />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 rounded-full border-4 animate-spin mb-6" style={{ borderColor: QUIZ.border, borderTopColor: QUIZ.accent }} />
          <h2 className="text-lg font-bold mb-2">{t("duel.searching")}</h2>
          <p className="text-sm mb-2" style={{ color: QUIZ.muted }}>
            {t("duel.searchingSubtitle")}
          </p>
          {onlineCount !== null && (
            <p className="text-xs mb-6" style={{ color: "#6B7A8A" }}>
              {t("duel.onlineCount", { count: onlineCount })}
            </p>
          )}
          <QuizButton variant="secondary" onClick={cancelSearching} className="px-6 w-auto">
            {t("duel.cancel")}
          </QuizButton>
        </div>
      </QuizShell>
    );
  }

  if (phase === "playing") {
    const question = questions[index];
    if (!question) return null;
    const myPct = (myAnswered / questions.length) * 100;
    const oppPct = (opponentAnswered / questions.length) * 100;

    return (
      <QuizShell>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-lg font-extrabold flex-1">{t("duel.vsTitle", { name: opponentName })}</h1>
          <span className="text-xs" style={{ color: QUIZ.muted }}>
            {index + 1}/{questions.length}
          </span>
        </div>

        {/* Ikkala o'yinchining progressi */}
        <div className="space-y-1.5 mb-6">
          <div>
            <p className="text-[10px] mb-0.5" style={{ color: QUIZ.muted }}>
              {t("duel.you")}
            </p>
            <QuizProgress pct={myPct} />
          </div>
          <div>
            <p className="text-[10px] mb-0.5" style={{ color: QUIZ.muted }}>
              {opponentName} {opponentFinished && `· ${t("duel.opponentDone")}`}
            </p>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: QUIZ.border }}>
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${oppPct}%`, background: QUIZ.warning }} />
            </div>
          </div>
        </div>

        {/* Duelda ham savol rasmi ikki xil bo'lishi mumkin (sahna/belgi) —
            QuestionImage o'zi ajratadi. */}
        <QuestionImage image={question.image} signSize={92} sceneMaxHeight={220} />

        <h2 className="text-[17px] font-bold leading-snug mb-5">{question.text}</h2>

        <div className="space-y-3">
          {question.options.map((opt, i) => (
            <OptionButton
              key={i}
              letter={String.fromCharCode(65 + i)}
              text={opt}
              state={selected === i ? "chosen" : "idle"}
              onClick={() => handleChoose(i)}
              disabled={selected !== null}
            />
          ))}
        </div>

        {myAnswered === questions.length && (
          <p className="text-center text-sm mt-6" style={{ color: QUIZ.muted }}>
            {t("duel.waitingOpponent")}
          </p>
        )}
      </QuizShell>
    );
  }

  if (phase === "finished" && result) {
    const isWin = result.result === "win";
    const isDraw = result.result === "draw";
    const Icon = isDraw ? Handshake : isWin ? Trophy : Frown;
    const color = isDraw ? QUIZ.muted : isWin ? QUIZ.success : QUIZ.danger;

    return (
      <QuizShell className="flex flex-col">
        <QuizHeader title={t("duel.title")} onBack={onExit} />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-5" style={{ background: `${color}22` }}>
            <Icon size={40} color={color} />
          </div>
          <h2 className="text-2xl font-extrabold mb-1">
            {isDraw ? t("duel.resultDraw") : isWin ? t("duel.resultWin") : t("duel.resultLose")}
          </h2>
          {result.forfeit && (
            <p className="text-xs mb-4" style={{ color: QUIZ.muted }}>
              {t("duel.forfeitNote")}
            </p>
          )}

          <div className="w-full flex gap-3 mt-6">
            <ScoreCard label={t("duel.you")} correct={result.me.correct} total={questions.length} highlight={isWin} />
            <ScoreCard label={result.opponent.name} correct={result.opponent.correct} total={questions.length} highlight={!isWin && !isDraw} />
          </div>
        </div>

        <div className="space-y-3 mt-6">
          <QuizButton onClick={openModeSelect}>{t("duel.playAgain")}</QuizButton>
          <QuizButton variant="ghost" onClick={onExit}>
            {t("duel.backHome")}
          </QuizButton>
        </div>
      </QuizShell>
    );
  }

  return null;
}

function ScoreCard({ label, correct, total, highlight }) {
  return (
    <div
      className="flex-1 rounded-2xl p-4 border"
      style={highlight ? { borderColor: "rgba(52,211,153,0.4)", background: QUIZ.successSoft } : { borderColor: QUIZ.border, background: QUIZ.card }}
    >
      <p className="text-xs mb-1 truncate" style={{ color: QUIZ.muted }}>
        {label}
      </p>
      <p className="text-xl font-extrabold">
        {correct}/{total}
      </p>
    </div>
  );
}
