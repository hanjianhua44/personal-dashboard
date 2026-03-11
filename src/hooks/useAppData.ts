import { useState, useCallback, useEffect } from 'react'
import type { AppData, TodayTask, BacklogItem, AnnualGoal, TeamMember, TeamTask } from '../types'
import { loadData, saveData } from '../utils/storage'

export function useAppData() {
  const [data, setData] = useState<AppData>(loadData)

  useEffect(() => {
    saveData(data)
  }, [data])

  const update = useCallback(<K extends keyof AppData>(key: K, value: AppData[K]) => {
    setData(prev => ({ ...prev, [key]: value }))
  }, [])

  const replaceAll = useCallback((newData: AppData) => {
    setData(newData)
  }, [])

  // Today Tasks
  const addTodayTask = useCallback((task: TodayTask) => {
    setData(prev => ({ ...prev, todayTasks: [...prev.todayTasks, task] }))
  }, [])

  const updateTodayTask = useCallback((id: string, patch: Partial<TodayTask>) => {
    setData(prev => ({
      ...prev,
      todayTasks: prev.todayTasks.map(t => t.id === id ? { ...t, ...patch } : t),
    }))
  }, [])

  const deleteTodayTask = useCallback((id: string) => {
    setData(prev => ({ ...prev, todayTasks: prev.todayTasks.filter(t => t.id !== id) }))
  }, [])

  // Backlog Items
  const addBacklogItem = useCallback((item: BacklogItem) => {
    setData(prev => ({ ...prev, backlogItems: [...prev.backlogItems, item] }))
  }, [])

  const updateBacklogItem = useCallback((id: string, patch: Partial<BacklogItem>) => {
    setData(prev => ({
      ...prev,
      backlogItems: prev.backlogItems.map(i => i.id === id ? { ...i, ...patch } : i),
    }))
  }, [])

  const deleteBacklogItem = useCallback((id: string) => {
    setData(prev => ({ ...prev, backlogItems: prev.backlogItems.filter(i => i.id !== id) }))
  }, [])

  // Annual Goals
  const addAnnualGoal = useCallback((goal: AnnualGoal) => {
    setData(prev => ({ ...prev, annualGoals: [...prev.annualGoals, goal] }))
  }, [])

  const updateAnnualGoal = useCallback((id: string, patch: Partial<AnnualGoal>) => {
    setData(prev => ({
      ...prev,
      annualGoals: prev.annualGoals.map(g => g.id === id ? { ...g, ...patch } : g),
    }))
  }, [])

  const deleteAnnualGoal = useCallback((id: string) => {
    setData(prev => ({ ...prev, annualGoals: prev.annualGoals.filter(g => g.id !== id) }))
  }, [])

  // Team Members
  const addTeamMember = useCallback((member: TeamMember) => {
    setData(prev => ({ ...prev, teamMembers: [...prev.teamMembers, member] }))
  }, [])

  const updateTeamMember = useCallback((id: string, patch: Partial<TeamMember>) => {
    setData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map(m => m.id === id ? { ...m, ...patch } : m),
    }))
  }, [])

  const deleteTeamMember = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(m => m.id !== id),
      teamTasks: prev.teamTasks.filter(t => t.assigneeId !== id),
    }))
  }, [])

  // Team Tasks
  const addTeamTask = useCallback((task: TeamTask) => {
    setData(prev => ({ ...prev, teamTasks: [...prev.teamTasks, task] }))
  }, [])

  const updateTeamTask = useCallback((id: string, patch: Partial<TeamTask>) => {
    setData(prev => ({
      ...prev,
      teamTasks: prev.teamTasks.map(t => t.id === id ? { ...t, ...patch } : t),
    }))
  }, [])

  const deleteTeamTask = useCallback((id: string) => {
    setData(prev => ({ ...prev, teamTasks: prev.teamTasks.filter(t => t.id !== id) }))
  }, [])

  return {
    data,
    update,
    replaceAll,
    addTodayTask, updateTodayTask, deleteTodayTask,
    addBacklogItem, updateBacklogItem, deleteBacklogItem,
    addAnnualGoal, updateAnnualGoal, deleteAnnualGoal,
    addTeamMember, updateTeamMember, deleteTeamMember,
    addTeamTask, updateTeamTask, deleteTeamTask,
  }
}
