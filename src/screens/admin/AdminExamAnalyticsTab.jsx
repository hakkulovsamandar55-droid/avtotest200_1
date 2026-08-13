import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown, Clock, Users, Percent } from "lucide-react";
import { api } from "../../api";
import { formatDuration } from "../../components/exam/ExamTimer";
import { Card } from "../../components/ui";

function Metric({ icon: Icon, value, label, tone }) {
  return (
    <Card className="px-3 py-3 text-center">
      <Icon size={15} className={`mx-auto mb-1.5 ${tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-soft"}`} />
      <p className="font-extrabold text-main text-sm">{value}</p>
      <p className="text-muted text-[10px] mt-0.5 leading-tight">{label}</p>
    </Card>
  );
}

function QuestionList({ title, questions, tone }) {
  const { t } = useTranslation();
  if (questions.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="font-bold text-main text-sm mb-2">{title}</p>
      <div className="space-y-2">
        {questions.map((q) => (
          <Card key={q.id} className="px-4 py-3">
            <p className="text-main text-xs leading-snug mb-2 line-clamp-3">{q.text}</p>
            <div className="flex items-center gap-3 text-[11px]">
              <span className={`font-bold ${tone === "hard" ? "text-danger" : "text-success"}`}>
                {q.correctRatePct}% {t("adminExam.correctRate")}
              </span>
              <span className="text-muted">{t("adminExam.shownTimes", { count: q.shown })}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/** Admin panel — rasmiy imtihon analitikasi. */
export default function AdminExamAnalyticsTab() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .getExamAnalytics()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <span className="w-6 h-6 rounded-full border-2 border-line border-t-main animate-spin" />
      </div>
    );
  }

  if (error) {
    return <p className="text-danger text-sm text-center py-6">{error}</p>;
  }

  const o = data.overview;

  return (
    <div className="pb-4">
      <div className="grid grid-cols-3 gap-2">
        <Metric icon={Users} value={o.totalExams} label={t("adminExam.totalExams")} />
        <Metric icon={TrendingUp} value={`${o.passRatePct}%`} label={t("adminExam.passRate")} tone="success" />
        <Metric icon={TrendingDown} value={`${o.failRatePct}%`} label={t("adminExam.failRate")} tone="danger" />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2">
        <Metric icon={Percent} value={o.averageScore} label={t("adminExam.averageScore")} />
        <Metric icon={Percent} value={`${o.averageAccuracyPct}%`} label={t("adminExam.averageAccuracy")} />
        <Metric icon={Clock} value={formatDuration(o.averageDurationSec)} label={t("adminExam.averageTime")} />
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <Metric icon={Users} value={o.examsToday} label={t("adminExam.today")} />
        <Metric icon={Users} value={o.examsThisMonth} label={t("adminExam.thisMonth")} />
      </div>

      <p className="text-muted text-[11px] mt-4 leading-relaxed">{t("adminExam.sampleNotice", { count: data.questions.sampleSize })}</p>

      <QuestionList title={t("adminExam.hardestQuestions")} questions={data.questions.hardest} tone="hard" />
      <QuestionList title={t("adminExam.easiestQuestions")} questions={data.questions.easiest} tone="easy" />
    </div>
  );
}
