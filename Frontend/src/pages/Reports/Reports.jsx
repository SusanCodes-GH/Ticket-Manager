import { useState, useEffect, useCallback } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";
import { getDashboardData, getTicketTrendData } from "../../services/reportService";
import { toast } from "../../utils/toast";
import styles from "./Reports.module.css";

const STATUS_COLORS = ["#3b82f6", "#f59e0b", "#22c55e", "#6b7280"];
const PRIORITY_COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#7f1d1d"];
const STATUS_LABELS = { open: "Open", "in-progress": "In Progress", resolved: "Resolved", closed: "Closed" };
const ACTION_LABELS = {
  ticket_created: "Ticket Created",
  ticket_updated: "Ticket Updated",
  ticket_assigned: "Ticket Assigned",
  ticket_status_changed: "Status Changed",
  comment_added: "Comment Added",
};
const ACTION_ICONS = {
  ticket_created: "fa-plus",
  ticket_updated: "fa-pen",
  ticket_assigned: "fa-user-check",
  ticket_status_changed: "fa-arrow-right-arrow-left",
  comment_added: "fa-comment",
};

function formatDate(ts) {
  if (!ts) return "—";
  if (typeof ts === "string") return new Date(ts).toLocaleString();
  if (ts?.toDate) return ts.toDate().toLocaleString();
  if (ts?._seconds) return new Date(ts._seconds * 1000).toLocaleString();
  return "—";
}

function formatDateShort(ts) {
  if (!ts) return "—";
  if (typeof ts === "string") return new Date(ts).toLocaleDateString();
  if (ts?.toDate) return ts.toDate().toLocaleDateString();
  if (ts?._seconds) return new Date(ts._seconds * 1000).toLocaleDateString();
  return "—";
}

function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{label || payload[0].name}</p>
        {payload.map((entry, i) => (
          <p key={i} className={styles.tooltipValue} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function SkeletonCard() {
  return <div className={styles.skeletonCard}><div className={styles.skeletonPulse}></div></div>;
}

function SkeletonChart() {
  return (
    <div className={styles.skeletonChart}>
      <div className={styles.skeletonPulse}></div>
    </div>
  );
}

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [trendDays, setTrendDays] = useState(7);
  const [trendData, setTrendData] = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (data) loadTrend();
  }, [trendDays]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const result = await getDashboardData();
      setData(result);
      loadTrend();
    } catch (err) {
      toast.error(err.message || "Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const loadTrend = useCallback(async () => {
    setTrendLoading(true);
    try {
      const result = await getTicketTrendData(trendDays);
      setTrendData(result);
    } catch (err) {
      toast.error(err.message || "Failed to load trend data");
    } finally {
      setTrendLoading(false);
    }
  }, [trendDays]);

  const formatTrendTick = (val) => {
    if (trendDays <= 7) {
      const d = new Date(val);
      return d.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
    }
    return val.slice(5);
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Reports & Analytics</h1>
        </div>
        <div className={styles.kpiGrid}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className={styles.chartGrid}>
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <SkeletonChart />
        <SkeletonChart />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <i className="fa-solid fa-chart-simple"></i>
          <p>Unable to load report data</p>
          <button className={styles.retryBtn} onClick={loadDashboard}>Retry</button>
        </div>
      </div>
    );
  }

  const { kpiCards, statusDistribution, priorityDistribution, teamPerformance, recentActivities } = data;

  const kpiItems = [
    { label: "Total Tickets", value: formatCount(kpiCards.totalTickets), icon: "fa-ticket", color: "#3b82f6" },
    { label: "Open", value: formatCount(kpiCards.openTickets), icon: "fa-folder-open", color: "#3b82f6" },
    { label: "In Progress", value: formatCount(kpiCards.inProgressTickets), icon: "fa-spinner", color: "#f59e0b" },
    { label: "Resolved", value: formatCount(kpiCards.resolvedTickets), icon: "fa-check-circle", color: "#22c55e" },
    { label: "Closed", value: formatCount(kpiCards.closedTickets), icon: "fa-circle-check", color: "#6b7280" },
    { label: "Team Members", value: formatCount(kpiCards.totalTeamMembers), icon: "fa-users", color: "#8b5cf6" },
  ];

  const statusPieData = statusDistribution.map(s => ({
    name: STATUS_LABELS[s.status] || s.status,
    value: s.count,
  }));

  const priorityBarData = priorityDistribution.map(p => ({
    priority: p.priority.charAt(0).toUpperCase() + p.priority.slice(1),
    count: p.count,
  }));

  const trendChartData = trendData.map(d => ({
    date: d.date,
    count: d.count,
  }));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Reports & Analytics</h1>
          <p className={styles.pageSubtitle}>Real-time insights from your ticket data</p>
        </div>
      </div>

      {/* SECTION 1 - KPI CARDS */}
      <section>
        <h2 className={styles.sectionTitle}>Overview</h2>
        <div className={styles.kpiGrid}>
          {kpiItems.map((item, i) => (
            <div key={i} className={styles.kpiCard}>
              <div className={styles.kpiIcon} style={{ background: `${item.color}15`, color: item.color }}>
                <i className={`fa-solid ${item.icon}`}></i>
              </div>
              <div className={styles.kpiInfo}>
                <span className={styles.kpiValue}>{item.value}</span>
                <span className={styles.kpiLabel}>{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2 - STATUS DISTRIBUTION + SECTION 3 - PRIORITY DISTRIBUTION */}
      <div className={styles.chartRow}>
        <section className={styles.chartSection}>
          <h2 className={styles.sectionTitle}>Status Distribution</h2>
          <div className={styles.chartBody}>
            {statusPieData.every(d => d.value === 0) ? (
              <div className={styles.chartEmpty}>
                <i className="fa-solid fa-chart-pie"></i>
                <p>No ticket data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={600}
                  >
                    {statusPieData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    formatter={(value) => <span className={styles.legendText}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className={styles.chartSection}>
          <h2 className={styles.sectionTitle}>Priority Distribution</h2>
          <div className={styles.chartBody}>
            {priorityBarData.every(d => d.count === 0) ? (
              <div className={styles.chartEmpty}>
                <i className="fa-solid fa-chart-bar"></i>
                <p>No ticket data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityBarData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="priority" tick={{ fontSize: 13, fill: "var(--text-secondary)" }} />
                  <YAxis tick={{ fontSize: 13, fill: "var(--text-secondary)" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={600}>
                    {priorityBarData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={PRIORITY_COLORS[i % PRIORITY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      {/* SECTION 4 - TEAM PERFORMANCE */}
      <section>
        <h2 className={styles.sectionTitle}>Team Performance</h2>
        <div className={styles.tableWrapper}>
          {teamPerformance.length === 0 ? (
            <div className={styles.tableEmpty}>
              <i className="fa-solid fa-users"></i>
              <p>No team members with assigned tickets yet</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Team Member</th>
                  <th>Assigned</th>
                  <th>Resolved</th>
                  <th>Open</th>
                  <th>Completion</th>
                </tr>
              </thead>
              <tbody>
                {teamPerformance.map((member, i) => (
                  <tr key={member.userId || i}>
                    <td>
                      <div className={styles.memberCell}>
                        <div className={styles.memberAvatar}>{member.name.charAt(0).toUpperCase()}</div>
                        {member.name}
                      </div>
                    </td>
                    <td>{member.assigned}</td>
                    <td>{member.resolved}</td>
                    <td>{member.open}</td>
                    <td>
                      <div className={styles.completionCell}>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{ width: `${member.completionRate}%` }}
                          ></div>
                        </div>
                        <span className={styles.completionText}>{member.completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* SECTION 5 - TICKET CREATION TREND */}
      <section>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Ticket Creation Trend</h2>
          <div className={styles.trendTabs}>
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                className={`${styles.trendTab} ${trendDays === d ? styles.trendTabActive : ""}`}
                onClick={() => setTrendDays(d)}
              >
                Last {d} Days
              </button>
            ))}
          </div>
        </div>
        <div className={styles.chartSection}>
          <div className={styles.chartBody}>
            {trendLoading ? (
              <div className={styles.chartLoading}>
                <i className="fa-solid fa-spinner fa-spin"></i>
              </div>
            ) : trendChartData.length === 0 || trendChartData.every(d => d.count === 0) ? (
              <div className={styles.chartEmpty}>
                <i className="fa-solid fa-chart-line"></i>
                <p>No tickets created in this period</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
                    tickFormatter={formatTrendTick}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 13, fill: "var(--text-secondary)" }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#3b82f6" }}
                    activeDot={{ r: 5 }}
                    animationDuration={600}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 6 - RECENT ACTIVITY */}
      <section>
        <h2 className={styles.sectionTitle}>Recent Activity</h2>
        <div className={styles.activityCard}>
          {recentActivities.length === 0 ? (
            <div className={styles.tableEmpty}>
              <i className="fa-solid fa-clock-rotate-left"></i>
              <p>No recent activity</p>
            </div>
          ) : (
            <div className={styles.activityTimeline}>
              {recentActivities.slice(0, 5).map((a, i) => (
                <div key={a.activityId || i} className={styles.activityItem}>
                  <div className={styles.activityDot}></div>
                  <div className={styles.activityBody}>
                    <div className={styles.activityHeader}>
                      <i className={`fa-solid ${ACTION_ICONS[a.action] || "fa-circle"}`}></i>
                      <span className={styles.activityAction}>{ACTION_LABELS[a.action] || a.action}</span>
                    </div>
                    <div className={styles.activityMeta}>
                      <span className={styles.activityUser}>
                        <i className="fa-solid fa-user"></i> {a.userName}
                      </span>
                      {a.ticketId && (
                        <span className={styles.activityTicket}>
                          <i className="fa-solid fa-ticket"></i> {a.ticketId}
                          {a.ticketTitle ? ` - ${a.ticketTitle}` : ""}
                        </span>
                      )}
                      <span className={styles.activityTime}>
                        <i className="fa-solid fa-clock"></i> {formatDateShort(a.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
