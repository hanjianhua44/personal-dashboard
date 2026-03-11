import { useState } from 'react'
import type { ViewType } from './types'
import { useAppData } from './hooks/useAppData'
import Sidebar from './components/layout/Sidebar'
import TodayPanel from './components/today/TodayPanel'
import BacklogPanel from './components/backlog/BacklogPanel'
import AnnualPanel from './components/annual/AnnualPanel'
import TeamPanel from './components/team/TeamPanel'
import SettingsPanel from './components/settings/SettingsPanel'

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('today')
  const store = useAppData()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      <main className="flex-1 p-8 overflow-y-auto max-w-4xl">
        {activeView === 'today' && (
          <TodayPanel
            tasks={store.data.todayTasks}
            onAdd={store.addTodayTask}
            onUpdate={store.updateTodayTask}
            onDelete={store.deleteTodayTask}
          />
        )}

        {activeView === 'backlog' && (
          <BacklogPanel
            items={store.data.backlogItems}
            onAdd={store.addBacklogItem}
            onUpdate={store.updateBacklogItem}
            onDelete={store.deleteBacklogItem}
            onMoveToToday={store.addTodayTask}
          />
        )}

        {activeView === 'annual' && (
          <AnnualPanel
            goals={store.data.annualGoals}
            onAdd={store.addAnnualGoal}
            onUpdate={store.updateAnnualGoal}
            onDelete={store.deleteAnnualGoal}
          />
        )}

        {activeView === 'team' && (
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
        )}

        {activeView === 'settings' && (
          <SettingsPanel
            data={store.data}
            onImport={store.replaceAll}
          />
        )}
      </main>
    </div>
  )
}
