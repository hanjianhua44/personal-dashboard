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
import TeamPanel from './components/team/TeamPanel'
import SettingsPanel from './components/settings/SettingsPanel'

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('overview')
  const store = useAppData()

  useExternalMessages(store.mergeMessages)
  useTaskReminder(store.data.todayTasks)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      <main className="flex-1 overflow-y-auto">
        {activeView === 'overview' && (
          <div className="p-3 max-w-7xl">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 items-start">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
                <TodayPanel
                  tasks={store.data.todayTasks}
                  onAdd={store.addTodayTask}
                  onUpdate={store.updateTodayTask}
                  onDelete={store.deleteTodayTask}
                />
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
                <BacklogPanel
                  items={store.data.backlogItems}
                  onAdd={store.addBacklogItem}
                  onUpdate={store.updateBacklogItem}
                  onDelete={store.deleteBacklogItem}
                  onMoveToToday={store.addTodayTask}
                />
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
                <AnnualPanel
                  goals={store.data.annualGoals}
                  onAdd={store.addAnnualGoal}
                  onUpdate={store.updateAnnualGoal}
                  onDelete={store.deleteAnnualGoal}
                />
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
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
        )}

        {activeView === 'team' && (
          <div className="p-8 max-w-4xl">
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
        )}

        {activeView === 'settings' && (
          <div className="p-8 max-w-4xl">
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
