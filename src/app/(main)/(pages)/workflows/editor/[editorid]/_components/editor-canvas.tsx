'use client'

import React, { useCallback, useMemo, useState } from 'react'
import  { ReactFlow,Node, Edge, Connection, ReactFlowInstance, addEdge, applyEdgeChanges, applyNodeChanges, Controls, MiniMap, ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { EditorCanvasCardType,EditorNodeType } from '@/lib/type'
import { useEditor } from '@/providers/editor-provider'
import EditorCanvasCardSingle from './editor-canvas-card-single'
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { toast } from 'sonner'
import { usePathname } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid';
import { EditorCanvasDefaultCardTypes } from '@/lib/constant'
import { Background } from '@xyflow/react'

type Props = {}

const initialNodes: EditorNodeType[] = []
const initialEdges: Edge[] = []

const EditorCanvas = (props: Props) => {
  const { dispatch, state } = useEditor()
  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)
  const [isWorkFlowLoading, setIsWorkFlowLoading] = useState<boolean>(false)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const pathname = usePathname()
  
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow') as EditorCanvasCardType['type']

      if (typeof type === 'undefined' || !type) {
        return
      }

      const triggerAlreadyExists = state.editor.elements.find(
        (node) => node.type === 'Trigger'
      )

      if (type === 'Trigger' && triggerAlreadyExists) {
        toast('Only one trigger can be added to automations at the moment')
        return
      }

      if (!reactFlowInstance) return
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode = {
        id: uuidv4(),
        type,
        position,
        data: {
          title: type,
          description: EditorCanvasDefaultCardTypes[type].description,
          completed: false,
          current: false,
          metadata: {},
          type: type,
        },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, state.editor.elements]
  )

  const onNodesChange = useCallback((changes: any) => {
    setNodes((nds) => applyNodeChanges(changes, nds))
  }, [setNodes])

  const onEdgesChange = useCallback((changes: any) => {
    setEdges((eds) => applyEdgeChanges(changes, eds))
  }, [setEdges])

  const onConnect = useCallback(
    (connection: Edge | Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  )

  const nodeTypes = useMemo(
    () => ({
      Action: EditorCanvasCardSingle,
      Trigger: EditorCanvasCardSingle,
      Email: EditorCanvasCardSingle,
      Condition: EditorCanvasCardSingle,
      AI: EditorCanvasCardSingle,
      Slack: EditorCanvasCardSingle,
      'Google Drive': EditorCanvasCardSingle,
      Notion: EditorCanvasCardSingle,
      Discord: EditorCanvasCardSingle,
      'Custom Webhook': EditorCanvasCardSingle,
      'Google Calendar': EditorCanvasCardSingle,
      Wait: EditorCanvasCardSingle,
    }),
    []
  )

  const handleClickCanvas = useCallback(() => {
    // Add your canvas click handler logic here
  }, [])

  return (
    <ReactFlowProvider>
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={70}>
        <div className="flex h-full items-center justify-center">
          <div
            style={{ width: '100%', height: '100%', paddingBottom: '70px' }}
            className="relative"
          >
            <ReactFlow
              className="w-[300px]"
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodes={nodes}
              onNodesChange={onNodesChange}
              edges={edges}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              fitView
              onClick={handleClickCanvas}
              nodeTypes={nodeTypes}
            />
             <Controls position="top-left" />
             <MiniMap
                  position="bottom-left"
                  className="!bg-background"
                  zoomable
                  pannable
            />
            <Background
                  //@ts-ignore
                  color="#eee"
                  gap={12}
                  size={1}
                />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
    </ReactFlowProvider>
  )
}

export default EditorCanvas

