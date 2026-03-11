export type Priority = 'high' | 'medium' | 'low'

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export type GoalStatus = 'not_started' | 'in_progress' | 'completed'

export interface TodayTask {
  id: string
  title: string
  priority: Priority
  completed: boolean
  date: string // YYYY-MM-DD
  createdAt: string
}

export interface BacklogItem {
  id: string
  title: string
  tags: string[]
  completed: boolean
  createdAt: string
}

export interface Milestone {
  id: string
  title: string
  completed: boolean
}

export interface AnnualGoal {
  id: string
  title: string
  status: GoalStatus
  progress: number // 0-100
  milestones: Milestone[]
  year: number
  createdAt: string
}

export interface TeamMember {
  id: string
  name: string
  avatar?: string // emoji or initials
  color: string
}

export interface TeamTask {
  id: string
  title: string
  assigneeId: string
  status: TaskStatus
  priority: Priority
  dueDate?: string
  createdAt: string
}

export interface AppData {
  todayTasks: TodayTask[]
  backlogItems: BacklogItem[]
  annualGoals: AnnualGoal[]
  teamMembers: TeamMember[]
  teamTasks: TeamTask[]
}

export type ViewType = 'today' | 'backlog' | 'annual' | 'team' | 'settings'
