import { useState } from 'react'
import type { ViewType } from './types'
import { useAppData } from './hooks/useAppData'
import { useExternalMessages } from './hooks/useExternalMessages'
import { useTaskReminder } from './hooks/useTaskReminder'
import Sidebar from './components/layout/Sidebar'
import TodayPanel from './components/today/TodayPanel'
import BacklogPanel from './components/backlog/BacklogPanel'
import AnnualPanel from './components/annual/AnnualPanel'
import MessagesPanel from './components/messages/MessagesPanel'
import IdeasPanel from './components/ideas/IdeasPanel'
import TeamPanel from './components/team/TeamPanel'
import SettingsPanel from './components/settings/SettingsPanel'

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('overview')
  const store = useAppData()

  useExternalMessages(store.mergeMessages)
  useTaskReminder(store.data.todayTasks)

  return (
    <div className="flex min-h-screen bg-mesh">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      <main className="flex-1 overflow-y-auto scrollbar-thin">
        {activeView === 'overview' && (
          <div className="p-4 max-w-7xl">
            <div className="mb-4">
              <h1 className="text-lg font-bold text-slate-800">
                {getGreeting()}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
              </p>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-4 card-hover gradient-border border-top-indigo">
                <TodayPanel
                  tasks={store.data.todayTasks}
                  onAdd={store.addTodayTask}
                  onUpdate={store.updateTodayTask}
                  onDelete={store.deleteTodayTask}
                />
              </div>

              <div className="space-y-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-4 card-hover gradient-border border-top-cyan">
                  <BacklogPanel
                    items={store.data.backlogItems}
                    onAdd={store.addBacklogItem}
                    onUpdate={store.updateBacklogItem}
                    onDelete={store.deleteBacklogItem}
                    onMoveToToday={store.addTodayTask}
                  />
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-4 card-hover gradient-border border-top-rose">
                  <MessagesPanel
                    messages={store.data.messages}
                    onAdd={store.addMessage}
                    onUpdate={store.updateMessage}
                    onDelete={store.deleteMessage}
                    onClearRead={store.clearReadMessages}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'annual' && (
          <div className="p-4 max-w-4xl">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-4 gradient-border border-top-amber">
              <AnnualPanel
                goals={store.data.annualGoals}
                onAdd={store.addAnnualGoal}
                onUpdate={store.updateAnnualGoal}
                onDelete={store.deleteAnnualGoal}
              />
            </div>
          </div>
        )}

        {activeView === 'ideas' && (
          <div className="p-4 max-w-4xl">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-4 gradient-border border-top-violet">
              <IdeasPanel
                ideas={store.data.ideas}
                onAdd={store.addIdea}
                onUpdate={store.updateIdea}
                onDelete={store.deleteIdea}
              />
            </div>
          </div>
        )}

        {activeView === 'team' && (
          <div className="p-4 max-w-4xl">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-4 gradient-border border-top-emerald">
              <TeamPanel
                members={store.data.teamMembers}
                tasks={store.data.teamTasks}
                onAddMember={store.addTeamMember}
                onUpdateMember={store.updateTeamMember}
                onDeleteMember={store.deleteTeamMember}
                onAddTask={store.addTeamTask}
                onUpdateTask={store.updateTeamTask}
                onDeleteTask={store.deleteTeamTask}
              />
            </div>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="p-4 max-w-4xl">
            <SettingsPanel
              data={store.data}
              onImport={store.replaceAll}
            />
          </div>
        )}
      </main>
    </div>
  )
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 6) return '🌙 夜深了，注意休息'
  if (h < 9) return '🌅 早上好，新的一天开始了'
  if (h < 12) return '☀️ 上午好，状态在线'
  if (h < 14) return '🍱 中午好，记得吃饭'
  if (h < 18) return '🔥 下午好，继续冲'
  if (h < 21) return '🌆 晚上好，今天辛苦了'
  return '🌙 夜深了，注意休息'
}
