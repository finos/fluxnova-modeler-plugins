declare const execution: DelegateExecution;

interface DelegateExecution {
    /**
     * activityInstanceDone
     * @returns void
     */
    activityInstanceDone(): void;

    /**
     * activityInstanceEndListenerFailure
     * @returns void
     */
    activityInstanceEndListenerFailure(): void;

    /**
     * activityInstanceStarted
     * @returns void
     */
    activityInstanceStarted(): void;

    /**
     * activityInstanceStarting
     * @returns void
     */
    activityInstanceStarting(): void;

    /**
     * addEventSubscription
     *
     * @param eventSubscriptionEntity - EventSubscriptionEntity
     * @returns void
     */
    addEventSubscription(eventSubscriptionEntity: EventSubscriptionEntity): void;

    /**
     * addExecutionObserver
     *
     * @param observer - ExecutionObserver
     * @returns void
     */
    addExecutionObserver(observer: ExecutionObserver): void;

    /**
     * addExternalTask
     *
     * @param externalTask - ExternalTaskEntity
     * @returns void
     */
    addExternalTask(externalTask: ExternalTaskEntity): void;

    /**
     * addIncident
     *
     * @param incident - IncidentEntity
     * @returns void
     */
    addIncident(incident: IncidentEntity): void;

    /**
     * addJob
     *
     * @param jobEntity - JobEntity
     * @returns void
     */
    addJob(jobEntity: JobEntity): void;

    /**
     * addTask
     *
     * @param taskEntity - TaskEntity
     * @returns void
     */
    addTask(taskEntity: TaskEntity): void;

    /**
     * addVariableInternal
     *
     * @param variable - VariableInstanceEntity
     * @returns void
     */
    addVariableInternal(variable: VariableInstanceEntity): void;

    /**
     * addVariableListener
     *
     * @param listener - VariableInstanceLifecycleListener
     * @returns void
     */
    addVariableListener(listener: VariableInstanceLifecycleListener): void;

    /**
     * clearDelayedEvents
     * @returns void
     */
    clearDelayedEvents(): void;

    /**
     * clearScope
     *
     * @param reason - String
     * @param skipCustomListeners - boolean
     * @param skipIoMappings - boolean
     * @param externallyTerminated - boolean
     * @returns void
     */
    clearScope(reason: string, skipCustomListeners: boolean, skipIoMappings: boolean, externallyTerminated: boolean): void;

    /**
     * collectVariables
     *
     * @param resultVariables - VariableMapImpl
     * @param variableNames - Collection
     * @param isLocal - boolean
     * @param deserializeValues - boolean
     * @returns void
     */
    collectVariables(resultVariables: VariableMapImpl, variableNames: Array<any>, isLocal: boolean, deserializeValues: boolean): void;

    /**
     * continueIfExecutionDoesNotAffectNextOperation
     *
     * @param dispatching - Callback
     * @param continuation - Callback
     * @param execution - PvmExecutionImpl
     * @returns void
     */
    continueIfExecutionDoesNotAffectNextOperation(dispatching: Callback, continuation: Callback, execution: PvmExecutionImpl): void;

    /**
     * createActivityExecutionMapping
     * @returns Map
     */
    createActivityExecutionMapping(): Map<any, any>;

    /**
     * createActivityExecutionMapping
     *
     * @param currentScope - ScopeImpl
     * @returns Map
     */
    createActivityExecutionMapping(currentScope: ScopeImpl): Map<any, any>;

    /**
     * createConcurrentExecution
     * @returns PvmExecutionImpl
     */
    createConcurrentExecution(): PvmExecutionImpl;

    /**
     * createExecution
     *
     * Return type depends on runtime class hierarchy:
     * - ActivityExecution
     * - ExecutionEntity
     * - PvmExecutionImpl
     */
    createExecution(): ActivityExecution | ExecutionEntity | PvmExecutionImpl;

    /**
     * createIncident
     *
     * @param incidentType - String
     * @param configuration - String
     * @returns Incident
     */
    createIncident(incidentType: string, configuration: string): Incident;

    /**
     * createIncident
     *
     * @param incidentType - String
     * @param configuration - String
     * @param message - String
     * @returns Incident
     */
    createIncident(incidentType: string, configuration: string, message: string): Incident;

    /**
     * createSubCaseInstance
     *
     * @param caseDefinition - CmmnCaseDefinition
     * @param businessKey - String
     *
     * Return type depends on runtime class hierarchy:
     * - CmmnCaseInstance
     * - CmmnExecution
     * - CaseExecutionEntity
     */
    createSubCaseInstance(caseDefinition: CmmnCaseDefinition, businessKey: string): CmmnCaseInstance | CmmnExecution | CaseExecutionEntity;

    /**
     * createSubCaseInstance
     *
     * @param caseDefinition - CmmnCaseDefinition
     *
     * Return type depends on runtime class hierarchy:
     * - CmmnExecution
     * - CaseExecutionEntity
     * - CmmnCaseInstance
     */
    createSubCaseInstance(caseDefinition: CmmnCaseDefinition): CmmnExecution | CaseExecutionEntity | CmmnCaseInstance;

    /**
     * createSubProcessInstance
     *
     * @param processDefinition - PvmProcessDefinition
     * @param businessKey - String
     * @param caseInstanceId - String
     *
     * Return type depends on runtime class hierarchy:
     * - ExecutionEntity
     * - PvmExecutionImpl
     * - PvmProcessInstance
     */
    createSubProcessInstance(processDefinition: PvmProcessDefinition, businessKey: string, caseInstanceId: string): ExecutionEntity | PvmExecutionImpl | PvmProcessInstance;

    /**
     * createSubProcessInstance
     *
     * @param processDefinition - PvmProcessDefinition
     * @param businessKey - String
     *
     * Return type depends on runtime class hierarchy:
     * - PvmProcessInstance
     * - PvmExecutionImpl
     */
    createSubProcessInstance(processDefinition: PvmProcessDefinition, businessKey: string): PvmProcessInstance | PvmExecutionImpl;

    /**
     * createSubProcessInstance
     *
     * @param processDefinition - PvmProcessDefinition
     *
     * Return type depends on runtime class hierarchy:
     * - PvmProcessInstance
     * - PvmExecutionImpl
     */
    createSubProcessInstance(processDefinition: PvmProcessDefinition): PvmProcessInstance | PvmExecutionImpl;

    /**
     * delayEvent
     *
     * @param targetScope - PvmExecutionImpl
     * @param variableEvent - VariableEvent
     * @returns void
     */
    delayEvent(targetScope: PvmExecutionImpl, variableEvent: VariableEvent): void;

    /**
     * delayEvent
     *
     * @param delayedVariableEvent - DelayedVariableEvent
     * @returns void
     */
    delayEvent(delayedVariableEvent: DelayedVariableEvent): void;

    /**
     * deleteCascade
     *
     * @param deleteReason - String
     * @param skipCustomListeners - boolean
     * @param skipIoMappings - boolean
     * @param externallyTerminated - boolean
     * @param skipSubprocesses - boolean
     * @returns void
     */
    deleteCascade(deleteReason: string, skipCustomListeners: boolean, skipIoMappings: boolean, externallyTerminated: boolean, skipSubprocesses: boolean): void;

    /**
     * deleteCascade
     *
     * @param deleteReason - String
     * @returns void
     */
    deleteCascade(deleteReason: string): void;

    /**
     * deleteCascade
     *
     * @param deleteReason - String
     * @param skipCustomListeners - boolean
     * @param skipIoMappings - boolean
     * @returns void
     */
    deleteCascade(deleteReason: string, skipCustomListeners: boolean, skipIoMappings: boolean): void;

    /**
     * destroy
     *
     * @param alwaysSkipIoMappings - boolean
     * @returns void
     */
    destroy(alwaysSkipIoMappings: boolean): void;

    /**
     * destroy
     * @returns void
     */
    destroy(): void;

    /**
     * dispatchDelayedEventsAndPerformOperation
     *
     * @param continuation - Callback
     * @returns void
     */
    dispatchDelayedEventsAndPerformOperation(continuation: Callback): void;

    /**
     * dispatchDelayedEventsAndPerformOperation
     *
     * @param atomicOperation - PvmAtomicOperation
     * @returns void
     */
    dispatchDelayedEventsAndPerformOperation(atomicOperation: PvmAtomicOperation): void;

    /**
     * dispatchEvent
     *
     * @param variableEvent - VariableEvent
     * @returns void
     */
    dispatchEvent(variableEvent: VariableEvent): void;

    /**
     * disposeScopeInstantiationContext
     * @returns void
     */
    disposeScopeInstantiationContext(): void;

    /**
     * end
     *
     * @param isScopeComplete - boolean
     * @returns void
     */
    end(isScopeComplete: boolean): void;

    /**
     * endCompensation
     * @returns void
     */
    endCompensation(): void;

    /**
     * enterActivityInstance
     * @returns void
     */
    enterActivityInstance(): void;

    /**
     * equals
     *
     * @param obj - Object
     * @returns boolean
     */
    equals(obj: any): boolean;

    /**
     * executeActivities
     *
     * @param activityStack - List
     * @param targetActivity - PvmActivity
     * @param targetTransition - PvmTransition
     * @param variables - Map
     * @param localVariables - Map
     * @param skipCustomListeners - boolean
     * @param skipIoMappings - boolean
     * @returns void
     */
    executeActivities(activityStack: Array<any>, targetActivity: PvmActivity, targetTransition: PvmTransition, variables: Map<any, any>, localVariables: Map<any, any>, skipCustomListeners: boolean, skipIoMappings: boolean): void;

    /**
     * executeActivitiesConcurrent
     *
     * @param activityStack - List
     * @param targetActivity - PvmActivity
     * @param targetTransition - PvmTransition
     * @param variables - Map
     * @param localVariables - Map
     * @param skipCustomListeners - boolean
     * @param skipIoMappings - boolean
     * @returns void
     */
    executeActivitiesConcurrent(activityStack: Array<any>, targetActivity: PvmActivity, targetTransition: PvmTransition, variables: Map<any, any>, localVariables: Map<any, any>, skipCustomListeners: boolean, skipIoMappings: boolean): void;

    /**
     * executeActivity
     *
     * @param activity - PvmActivity
     * @returns void
     */
    executeActivity(activity: PvmActivity): void;

    /**
     * executeEventHandlerActivity
     *
     * @param eventHandlerActivity - ActivityImpl
     * @returns void
     */
    executeEventHandlerActivity(eventHandlerActivity: ActivityImpl): void;

    /**
     * executeIoMapping
     * @returns void
     */
    executeIoMapping(): void;

    /**
     * findActiveActivityIds
     * @returns List
     */
    findActiveActivityIds(): Array<any>;

    /**
     * findExecution
     *
     * @param activityId - String
     *
     * Return type depends on runtime class hierarchy:
     * - PvmExecutionImpl
     * - PvmExecution
     */
    findExecution(activityId: string): PvmExecutionImpl | PvmExecution;

    /**
     * findExecutionForFlowScope
     *
     * @param targetScope - PvmScope
     *
     * Return type depends on runtime class hierarchy:
     * - ActivityExecution
     * - PvmExecutionImpl
     */
    findExecutionForFlowScope(targetScope: PvmScope): ActivityExecution | PvmExecutionImpl;

    /**
     * findExecutionForScope
     *
     * @param currentScope - ScopeImpl
     * @param targetScope - ScopeImpl
     * @returns PvmExecutionImpl
     */
    findExecutionForScope(currentScope: ScopeImpl, targetScope: ScopeImpl): PvmExecutionImpl;

    /**
     * findExecutions
     *
     * @param activityId - String
     * @returns List
     */
    findExecutions(activityId: string): Array<any>;

    /**
     * findInactiveChildExecutions
     *
     * @param activity - PvmActivity
     * @returns List
     */
    findInactiveChildExecutions(activity: PvmActivity): Array<any>;

    /**
     * findInactiveConcurrentExecutions
     *
     * @param activity - PvmActivity
     * @returns List
     */
    findInactiveConcurrentExecutions(activity: PvmActivity): Array<any>;

    /**
     * findIncidentHandler
     *
     * @param incidentType - String
     * @returns IncidentHandler
     */
    findIncidentHandler(incidentType: string): IncidentHandler;

    /**
     * fireHistoricActivityInstanceUpdate
     * @returns void
     */
    fireHistoricActivityInstanceUpdate(): void;

    /**
     * fireHistoricProcessStartEvent
     * @returns void
     */
    fireHistoricProcessStartEvent(): void;

    /**
     * forceUpdate
     * @returns void
     */
    forceUpdate(): void;

    /**
     * getActivity
     *
     * Return type depends on runtime class hierarchy:
     * - PvmActivity
     * - ActivityImpl
     */
    getActivity(): PvmActivity | ActivityImpl;

    /**
     * getActivityId
     * @returns String
     */
    getActivityId(): string;

    /**
     * getActivityInstanceId
     * @returns String
     */
    getActivityInstanceId(): string;

    /**
     * getActivityInstanceState
     * @returns int
     */
    getActivityInstanceState(): number;

    /**
     * getBpmnModelElementInstance
     * @returns FlowElement
     */
    getBpmnModelElementInstance(): FlowElement;

    /**
     * getBpmnModelInstance
     * @returns BpmnModelInstance
     */
    getBpmnModelInstance(): BpmnModelInstance;

    /**
     * getBusinessKey
     * @returns String
     */
    getBusinessKey(): string;

    /**
     * getBusinessKeyWithoutCascade
     * @returns String
     */
    getBusinessKeyWithoutCascade(): string;

    /**
     * getCachedElContext
     * @returns ELContext
     */
    getCachedElContext(): ELContext;

    /**
     * getCachedEntityState
     * @returns int
     */
    getCachedEntityState(): number;

    /**
     * getCachedEntityStateRaw
     * @returns int
     */
    getCachedEntityStateRaw(): number;

    /**
     * getCaseInstanceId
     * @returns String
     */
    getCaseInstanceId(): string;

    /**
     * getClass
     * @returns Class
     */
    getClass(): any;

    /**
     * getCompensateEventSubscriptions
     * @returns List
     */
    getCompensateEventSubscriptions(): Array<any>;

    /**
     * getCompensateEventSubscriptions
     *
     * @param activityId - String
     * @returns List
     */
    getCompensateEventSubscriptions(activityId: string): Array<any>;

    /**
     * getCurrentActivityId
     * @returns String
     */
    getCurrentActivityId(): string;

    /**
     * getCurrentActivityName
     * @returns String
     */
    getCurrentActivityName(): string;

    /**
     * getCurrentTransitionId
     * @returns String
     */
    getCurrentTransitionId(): string;

    /**
     * getDelayedEvents
     * @returns List
     */
    getDelayedEvents(): Array<any>;

    /**
     * getDeleteReason
     * @returns String
     */
    getDeleteReason(): string;

    /**
     * getDependentEntities
     * @returns Map
     */
    getDependentEntities(): Map<any, any>;

    /**
     * getEventName
     * @returns String
     */
    getEventName(): string;

    /**
     * getEventScopeExecutions
     * @returns List
     */
    getEventScopeExecutions(): Array<any>;

    /**
     * getEventSource
     * @returns CoreModelElement
     */
    getEventSource(): CoreModelElement;

    /**
     * getEventSubscriptions
     * @returns List
     */
    getEventSubscriptions(): Array<any>;

    /**
     * getEventSubscriptionsInternal
     * @returns List
     */
    getEventSubscriptionsInternal(): Array<any>;

    /**
     * getExecutions
     * @returns List
     */
    getExecutions(): Array<any>;

    /**
     * getExecutionsAsCopy
     * @returns List
     */
    getExecutionsAsCopy(): Array<any>;

    /**
     * getExternalTasks
     * @returns List
     */
    getExternalTasks(): Array<any>;

    /**
     * getId
     * @returns String
     */
    getId(): string;

    /**
     * getIncidentByCauseIncidentId
     *
     * @param causeIncidentId - String
     * @returns IncidentEntity
     */
    getIncidentByCauseIncidentId(causeIncidentId: string): IncidentEntity;

    /**
     * getIncidents
     * @returns List
     */
    getIncidents(): Array<any>;

    /**
     * getJobs
     * @returns List
     */
    getJobs(): Array<any>;

    /**
     * getListenerIndex
     * @returns int
     */
    getListenerIndex(): number;

    /**
     * getNextActivity
     * @returns PvmActivity
     */
    getNextActivity(): PvmActivity;

    /**
     * getNonEventScopeExecutions
     * @returns List
     */
    getNonEventScopeExecutions(): Array<any>;

    /**
     * getParent
     *
     * Return type depends on runtime class hierarchy:
     * - ActivityExecution
     * - PvmExecutionImpl
     * - ExecutionEntity
     */
    getParent(): ActivityExecution | PvmExecutionImpl | ExecutionEntity;

    /**
     * getParentActivityInstanceId
     * @returns String
     */
    getParentActivityInstanceId(): string;

    /**
     * getParentId
     * @returns String
     */
    getParentId(): string;

    /**
     * getParentScopeExecution
     *
     * @param considerSuperExecution - boolean
     * @returns PvmExecutionImpl
     */
    getParentScopeExecution(considerSuperExecution: boolean): PvmExecutionImpl;

    /**
     * getParentVariableScope
     * @returns AbstractVariableScope
     */
    getParentVariableScope(): AbstractVariableScope;

    /**
     * getPayloadForTriggeredScope
     * @returns Map
     */
    getPayloadForTriggeredScope(): Map<any, any>;

    /**
     * getPersistentState
     * @returns Object
     */
    getPersistentState(): any;

    /**
     * getProcessBusinessKey
     * @returns String
     */
    getProcessBusinessKey(): string;

    /**
     * getProcessDefinition
     *
     * Return type depends on runtime class hierarchy:
     * - ProcessDefinitionImpl
     * - ProcessDefinitionEntity
     */
    getProcessDefinition(): ProcessDefinitionImpl | ProcessDefinitionEntity;

    /**
     * getProcessDefinitionId
     * @returns String
     */
    getProcessDefinitionId(): string;

    /**
     * getProcessDefinitionKey
     * @returns String
     */
    getProcessDefinitionKey(): string;

    /**
     * getProcessDefinitionTenantId
     * @returns String
     */
    getProcessDefinitionTenantId(): string;

    /**
     * getProcessEngine
     * @returns ProcessEngine
     */
    getProcessEngine(): ProcessEngine;

    /**
     * getProcessEngineServices
     * @returns ProcessEngineServices
     */
    getProcessEngineServices(): ProcessEngineServices;

    /**
     * getProcessInstance
     *
     * Return type depends on runtime class hierarchy:
     * - PvmExecutionImpl
     * - DelegateExecution
     * - ExecutionEntity
     */
    getProcessInstance(): PvmExecutionImpl | DelegateExecution | ExecutionEntity;

    /**
     * getProcessInstanceId
     * @returns String
     */
    getProcessInstanceId(): string;

    /**
     * getReferencedEntitiesIdAndClass
     * @returns Map
     */
    getReferencedEntitiesIdAndClass(): Map<any, any>;

    /**
     * getReferencedEntityIds
     * @returns Set
     */
    getReferencedEntityIds(): Set<any>;

    /**
     * getReplacedBy
     *
     * Return type depends on runtime class hierarchy:
     * - PvmExecutionImpl
     * - ExecutionEntity
     */
    getReplacedBy(): PvmExecutionImpl | ExecutionEntity;

    /**
     * getRestartedProcessInstanceId
     * @returns String
     */
    getRestartedProcessInstanceId(): string;

    /**
     * getRevision
     * @returns int
     */
    getRevision(): number;

    /**
     * getRevisionNext
     * @returns int
     */
    getRevisionNext(): number;

    /**
     * getRootProcessInstanceId
     * @returns String
     */
    getRootProcessInstanceId(): string;

    /**
     * getRootProcessInstanceIdRaw
     * @returns String
     */
    getRootProcessInstanceIdRaw(): string;

    /**
     * getScopeInstantiationContext
     * @returns ScopeInstantiationContext
     */
    getScopeInstantiationContext(): ScopeInstantiationContext;

    /**
     * getSequenceCounter
     * @returns long
     */
    getSequenceCounter(): number;

    /**
     * getSubCaseInstance
     *
     * Return type depends on runtime class hierarchy:
     * - CmmnExecution
     * - CaseExecutionEntity
     */
    getSubCaseInstance(): CmmnExecution | CaseExecutionEntity;

    /**
     * getSubProcessInstance
     *
     * Return type depends on runtime class hierarchy:
     * - PvmExecutionImpl
     * - ExecutionEntity
     */
    getSubProcessInstance(): PvmExecutionImpl | ExecutionEntity;

    /**
     * getSuperCaseExecution
     *
     * Return type depends on runtime class hierarchy:
     * - CaseExecutionEntity
     * - CmmnExecution
     */
    getSuperCaseExecution(): CaseExecutionEntity | CmmnExecution;

    /**
     * getSuperCaseExecutionId
     * @returns String
     */
    getSuperCaseExecutionId(): string;

    /**
     * getSuperExecution
     *
     * Return type depends on runtime class hierarchy:
     * - ExecutionEntity
     * - PvmExecutionImpl
     * - DelegateExecution
     */
    getSuperExecution(): ExecutionEntity | PvmExecutionImpl | DelegateExecution;

    /**
     * getSuperExecutionId
     * @returns String
     */
    getSuperExecutionId(): string;

    /**
     * getSuspensionState
     * @returns int
     */
    getSuspensionState(): number;

    /**
     * getTasks
     * @returns List
     */
    getTasks(): Array<any>;

    /**
     * getTenantId
     * @returns String
     */
    getTenantId(): string;

    /**
     * getTransition
     * @returns TransitionImpl
     */
    getTransition(): TransitionImpl;

    /**
     * getTransitionsToTake
     * @returns List
     */
    getTransitionsToTake(): Array<any>;

    /**
     * getVariable
     *
     * @param variableName - String
     * @returns Object
     */
    getVariable(variableName: string): any;

    /**
     * getVariable
     *
     * @param variableName - String
     * @param deserializeObjectValue - boolean
     * @returns Object
     */
    getVariable(variableName: string, deserializeObjectValue: boolean): any;

    /**
     * getVariableInstance
     *
     * @param variableName - String
     * @returns CoreVariableInstance
     */
    getVariableInstance(variableName: string): CoreVariableInstance;

    /**
     * getVariableInstanceLocal
     *
     * @param name - String
     * @returns CoreVariableInstance
     */
    getVariableInstanceLocal(name: string): CoreVariableInstance;

    /**
     * getVariableInstancesLocal
     * @returns List
     */
    getVariableInstancesLocal(): Array<any>;

    /**
     * getVariableInstancesLocal
     *
     * @param variableNames - Collection
     * @returns List
     */
    getVariableInstancesLocal(variableNames: Array<any>): Array<any>;

    /**
     * getVariableLocal
     *
     * @param variableName - String
     * @returns Object
     */
    getVariableLocal(variableName: string): any;

    /**
     * getVariableLocal
     *
     * @param variableName - String
     * @param deserializeObjectValue - boolean
     * @returns Object
     */
    getVariableLocal(variableName: string, deserializeObjectValue: boolean): any;

    /**
     * getVariableLocalTyped
     *
     * @param variableName - String
     * @param deserializeValue - boolean
     * @returns TypedValue
     */
    getVariableLocalTyped(variableName: string, deserializeValue: boolean): TypedValue;

    /**
     * getVariableLocalTyped
     *
     * @param variableName - String
     * @returns TypedValue
     */
    getVariableLocalTyped(variableName: string): TypedValue;

    /**
     * getVariableNames
     * @returns Set
     */
    getVariableNames(): Set<any>;

    /**
     * getVariableNamesLocal
     * @returns Set
     */
    getVariableNamesLocal(): Set<any>;

    /**
     * getVariablePersistenceListener
     * @returns VariableInstanceLifecycleListener
     */
    getVariablePersistenceListener(): VariableInstanceLifecycleListener;

    /**
     * getVariableScopeKey
     * @returns String
     */
    getVariableScopeKey(): string;

    /**
     * getVariableTyped
     *
     * @param variableName - String
     * @returns TypedValue
     */
    getVariableTyped(variableName: string): TypedValue;

    /**
     * getVariableTyped
     *
     * @param variableName - String
     * @param deserializeValue - boolean
     * @returns TypedValue
     */
    getVariableTyped(variableName: string, deserializeValue: boolean): TypedValue;

    /**
     * getVariables
     *
     * Return type depends on runtime class hierarchy:
     * - VariableMapImpl
     * - Map
     */
    getVariables(): VariableMapImpl | Map<any, any>;

    /**
     * getVariablesInternal
     * @returns Collection
     */
    getVariablesInternal(): Array<any>;

    /**
     * getVariablesLocal
     *
     * Return type depends on runtime class hierarchy:
     * - VariableMapImpl
     * - Map
     */
    getVariablesLocal(): VariableMapImpl | Map<any, any>;

    /**
     * getVariablesLocalTyped
     *
     * Return type depends on runtime class hierarchy:
     * - VariableMap
     * - VariableMapImpl
     */
    getVariablesLocalTyped(): VariableMap | VariableMapImpl;

    /**
     * getVariablesLocalTyped
     *
     * @param deserializeObjectValues - boolean
     *
     * Return type depends on runtime class hierarchy:
     * - VariableMapImpl
     * - VariableMap
     */
    getVariablesLocalTyped(deserializeObjectValues: boolean): VariableMapImpl | VariableMap;

    /**
     * getVariablesTyped
     *
     * Return type depends on runtime class hierarchy:
     * - VariableMap
     * - VariableMapImpl
     */
    getVariablesTyped(): VariableMap | VariableMapImpl;

    /**
     * getVariablesTyped
     *
     * @param deserializeValues - boolean
     *
     * Return type depends on runtime class hierarchy:
     * - VariableMap
     * - VariableMapImpl
     */
    getVariablesTyped(deserializeValues: boolean): VariableMap | VariableMapImpl;

    /**
     * handleConditionalEventOnVariableChange
     *
     * @param variableEvent - VariableEvent
     * @returns void
     */
    handleConditionalEventOnVariableChange(variableEvent: VariableEvent): void;

    /**
     * hasChildren
     * @returns boolean
     */
    hasChildren(): boolean;

    /**
     * hasFailedOnEndListeners
     * @returns boolean
     */
    hasFailedOnEndListeners(): boolean;

    /**
     * hasReplacedParent
     * @returns boolean
     */
    hasReplacedParent(): boolean;

    /**
     * hasVariable
     *
     * @param variableName - String
     * @returns boolean
     */
    hasVariable(variableName: string): boolean;

    /**
     * hasVariableLocal
     *
     * @param variableName - String
     * @returns boolean
     */
    hasVariableLocal(variableName: string): boolean;

    /**
     * hasVariables
     * @returns boolean
     */
    hasVariables(): boolean;

    /**
     * hasVariablesLocal
     * @returns boolean
     */
    hasVariablesLocal(): boolean;

    /**
     * hashCode
     * @returns int
     */
    hashCode(): number;

    /**
     * inactivate
     * @returns void
     */
    inactivate(): void;

    /**
     * incrementSequenceCounter
     * @returns void
     */
    incrementSequenceCounter(): void;

    /**
     * initialize
     * @returns void
     */
    initialize(): void;

    /**
     * initializeTimerDeclarations
     * @returns void
     */
    initializeTimerDeclarations(): void;

    /**
     * initializeVariableStore
     *
     * @param variables - Map
     * @returns void
     */
    initializeVariableStore(variables: Map<any, any>): void;

    /**
     * insert
     * @returns void
     */
    insert(): void;

    /**
     * instantiateScopes
     *
     * @param activityStack - List
     * @param skipCustomListeners - boolean
     * @param skipIoMappings - boolean
     * @returns Map
     */
    instantiateScopes(activityStack: Array<any>, skipCustomListeners: boolean, skipIoMappings: boolean): Map<any, any>;

    /**
     * interrupt
     *
     * @param reason - String
     * @param skipCustomListeners - boolean
     * @param skipIoMappings - boolean
     * @param externallyTerminated - boolean
     * @returns void
     */
    interrupt(reason: string, skipCustomListeners: boolean, skipIoMappings: boolean, externallyTerminated: boolean): void;

    /**
     * interrupt
     *
     * @param reason - String
     * @returns void
     */
    interrupt(reason: string): void;

    /**
     * invokeListener
     *
     * @param listener - DelegateListener
     * @returns void
     * @throws java.lang.Exception
     */
    invokeListener(listener: DelegateListener): void;

    /**
     * isActive
     *
     * @param activityId - String
     * @returns boolean
     */
    isActive(activityId: string): boolean;

    /**
     * isActive
     * @returns boolean
     */
    isActive(): boolean;

    /**
     * isAsyncAfterScopeWithoutTransition
     * @returns boolean
     */
    isAsyncAfterScopeWithoutTransition(): boolean;

    /**
     * isCanceled
     * @returns boolean
     */
    isCanceled(): boolean;

    /**
     * isCompleteScope
     * @returns boolean
     */
    isCompleteScope(): boolean;

    /**
     * isConcurrent
     * @returns boolean
     */
    isConcurrent(): boolean;

    /**
     * isDeleteRoot
     * @returns boolean
     */
    isDeleteRoot(): boolean;

    /**
     * isEnded
     * @returns boolean
     */
    isEnded(): boolean;

    /**
     * isEventScope
     * @returns boolean
     */
    isEventScope(): boolean;

    /**
     * isExecutingScopeLeafActivity
     * @returns boolean
     */
    isExecutingScopeLeafActivity(): boolean;

    /**
     * isExternallyTerminated
     * @returns boolean
     */
    isExternallyTerminated(): boolean;

    /**
     * isIgnoreAsync
     * @returns boolean
     */
    isIgnoreAsync(): boolean;

    /**
     * isInState
     *
     * @param state - ActivityInstanceState
     * @returns boolean
     */
    isInState(state: ActivityInstanceState): boolean;

    /**
     * isPreserveScope
     * @returns boolean
     */
    isPreserveScope(): boolean;

    /**
     * isProcessInstanceExecution
     * @returns boolean
     */
    isProcessInstanceExecution(): boolean;

    /**
     * isProcessInstanceStarting
     * @returns boolean
     */
    isProcessInstanceStarting(): boolean;

    /**
     * isRemoved
     * @returns boolean
     */
    isRemoved(): boolean;

    /**
     * isReplacedByParent
     * @returns boolean
     */
    isReplacedByParent(): boolean;

    /**
     * isScope
     * @returns boolean
     */
    isScope(): boolean;

    /**
     * isSkipCustomListeners
     * @returns boolean
     */
    isSkipCustomListeners(): boolean;

    /**
     * isSkipIoMappings
     * @returns boolean
     */
    isSkipIoMappings(): boolean;

    /**
     * isSkipSubprocesses
     * @returns boolean
     */
    isSkipSubprocesses(): boolean;

    /**
     * isStarting
     * @returns boolean
     */
    isStarting(): boolean;

    /**
     * isSuspended
     * @returns boolean
     */
    isSuspended(): boolean;

    /**
     * leaveActivityInstance
     * @returns void
     */
    leaveActivityInstance(): void;

    /**
     * leaveActivityViaTransition
     *
     * @param outgoingTransition - PvmTransition
     * @returns void
     */
    leaveActivityViaTransition(outgoingTransition: PvmTransition): void;

    /**
     * leaveActivityViaTransitions
     *
     * @param outgoingTransitions - List
     * @param joinedExecutions - List
     * @returns void
     */
    leaveActivityViaTransitions(outgoingTransitions: Array<any>, joinedExecutions: Array<any>): void;

    /**
     * notify
     * @returns void
     */
    notify(): void;

    /**
     * notifyAll
     * @returns void
     */
    notifyAll(): void;

    /**
     * onConcurrentExpand
     *
     * @param scopeExecution - PvmExecutionImpl
     * @returns void
     */
    onConcurrentExpand(scopeExecution: PvmExecutionImpl): void;

    /**
     * performOperation
     *
     * @param operation - CoreAtomicOperation
     * @returns void
     */
    performOperation(operation: CoreAtomicOperation): void;

    /**
     * performOperation
     *
     * @param operation - AtomicOperation
     * @returns void
     */
    performOperation(operation: AtomicOperation): void;

    /**
     * performOperationSync
     *
     * @param operation - AtomicOperation
     * @returns void
     */
    performOperationSync(operation: AtomicOperation): void;

    /**
     * performOperationSync
     *
     * @param operation - CoreAtomicOperation
     * @returns void
     */
    performOperationSync(operation: CoreAtomicOperation): void;

    /**
     * propagateEnd
     * @returns void
     */
    propagateEnd(): void;

    /**
     * provideVariables
     * @returns Collection
     */
    provideVariables(): Array<any>;

    /**
     * provideVariables
     *
     * @param variableNames - Collection
     * @returns Collection
     */
    provideVariables(variableNames: Array<any>): Array<any>;

    /**
     * remove
     * @returns void
     */
    remove(): void;

    /**
     * removeAllTasks
     * @returns void
     */
    removeAllTasks(): void;

    /**
     * removeEventSubscription
     *
     * @param eventSubscriptionEntity - EventSubscriptionEntity
     * @returns void
     */
    removeEventSubscription(eventSubscriptionEntity: EventSubscriptionEntity): void;

    /**
     * removeEventSubscriptions
     * @returns void
     */
    removeEventSubscriptions(): void;

    /**
     * removeExecutionObserver
     *
     * @param observer - ExecutionObserver
     * @returns void
     */
    removeExecutionObserver(observer: ExecutionObserver): void;

    /**
     * removeExternalTask
     *
     * @param externalTask - ExternalTaskEntity
     * @returns void
     */
    removeExternalTask(externalTask: ExternalTaskEntity): void;

    /**
     * removeIncident
     *
     * @param incident - IncidentEntity
     * @returns void
     */
    removeIncident(incident: IncidentEntity): void;

    /**
     * removeJob
     *
     * @param job - JobEntity
     * @returns void
     */
    removeJob(job: JobEntity): void;

    /**
     * removeTask
     *
     * @param task - TaskEntity
     * @returns void
     */
    removeTask(task: TaskEntity): void;

    /**
     * removeVariable
     *
     * @param variableName - String
     * @returns void
     */
    removeVariable(variableName: string): void;

    /**
     * removeVariableInternal
     *
     * @param variable - VariableInstanceEntity
     * @returns void
     */
    removeVariableInternal(variable: VariableInstanceEntity): void;

    /**
     * removeVariableListener
     *
     * @param listener - VariableInstanceLifecycleListener
     * @returns void
     */
    removeVariableListener(listener: VariableInstanceLifecycleListener): void;

    /**
     * removeVariableLocal
     *
     * @param variableName - String
     * @returns void
     */
    removeVariableLocal(variableName: string): void;

    /**
     * removeVariables
     * @returns void
     */
    removeVariables(): void;

    /**
     * removeVariables
     *
     * @param variableNames - Collection
     * @returns void
     */
    removeVariables(variableNames: Array<any>): void;

    /**
     * removeVariablesLocal
     * @returns void
     */
    removeVariablesLocal(): void;

    /**
     * removeVariablesLocal
     *
     * @param variableNames - Collection
     * @returns void
     */
    removeVariablesLocal(variableNames: Array<any>): void;

    /**
     * removeVariablesLocalInternal
     * @returns void
     */
    removeVariablesLocalInternal(): void;

    /**
     * replace
     *
     * @param execution - PvmExecutionImpl
     * @returns void
     */
    replace(execution: PvmExecutionImpl): void;

    /**
     * resolveIncident
     *
     * @param incidentId - String
     * @returns void
     */
    resolveIncident(incidentId: string): void;

    /**
     * resolveReplacedBy
     *
     * Return type depends on runtime class hierarchy:
     * - ExecutionEntity
     * - PvmExecutionImpl
     */
    resolveReplacedBy(): ExecutionEntity | PvmExecutionImpl;

    /**
     * restoreProcessInstance
     *
     * @param executions - Collection
     * @param eventSubscriptions - Collection
     * @param variables - Collection
     * @param tasks - Collection
     * @param jobs - Collection
     * @param incidents - Collection
     * @param externalTasks - Collection
     * @returns void
     */
    restoreProcessInstance(executions: Array<any>, eventSubscriptions: Array<any>, variables: Array<any>, tasks: Array<any>, jobs: Array<any>, incidents: Array<any>, externalTasks: Array<any>): void;

    /**
     * scheduleAtomicOperationAsync
     *
     * @param executionOperationInvocation - AtomicOperationInvocation
     * @returns void
     */
    scheduleAtomicOperationAsync(executionOperationInvocation: AtomicOperationInvocation): void;

    /**
     * setActive
     *
     * @param isActive - boolean
     * @returns void
     */
    setActive(isActive: boolean): void;

    /**
     * setActivity
     *
     * @param activity - PvmActivity
     * @returns void
     */
    setActivity(activity: PvmActivity): void;

    /**
     * setActivityId
     *
     * @param activityId - String
     * @returns void
     */
    setActivityId(activityId: string): void;

    /**
     * setActivityInstanceId
     *
     * @param id - String
     * @returns void
     */
    setActivityInstanceId(id: string): void;

    /**
     * setBusinessKey
     *
     * @param businessKey - String
     * @returns void
     */
    setBusinessKey(businessKey: string): void;

    /**
     * setCachedElContext
     *
     * @param cachedElContext - ELContext
     * @returns void
     */
    setCachedElContext(cachedElContext: ELContext): void;

    /**
     * setCachedEntityState
     *
     * @param cachedEntityState - int
     * @returns void
     */
    setCachedEntityState(cachedEntityState: number): void;

    /**
     * setCanceled
     *
     * @param canceled - boolean
     * @returns void
     */
    setCanceled(canceled: boolean): void;

    /**
     * setCaseInstanceId
     *
     * @param caseInstanceId - String
     * @returns void
     */
    setCaseInstanceId(caseInstanceId: string): void;

    /**
     * setCompleteScope
     *
     * @param completeScope - boolean
     * @returns void
     */
    setCompleteScope(completeScope: boolean): void;

    /**
     * setConcurrent
     *
     * @param isConcurrent - boolean
     * @returns void
     */
    setConcurrent(isConcurrent: boolean): void;

    /**
     * setDeleteReason
     *
     * @param deleteReason - String
     * @returns void
     */
    setDeleteReason(deleteReason: string): void;

    /**
     * setDeleteRoot
     *
     * @param deleteRoot - boolean
     * @returns void
     */
    setDeleteRoot(deleteRoot: boolean): void;

    /**
     * setEnded
     *
     * @param b - boolean
     * @returns void
     */
    setEnded(b: boolean): void;

    /**
     * setEventName
     *
     * @param eventName - String
     * @returns void
     */
    setEventName(eventName: string): void;

    /**
     * setEventScope
     *
     * @param isEventScope - boolean
     * @returns void
     */
    setEventScope(isEventScope: boolean): void;

    /**
     * setEventSource
     *
     * @param eventSource - CoreModelElement
     * @returns void
     */
    setEventSource(eventSource: CoreModelElement): void;

    /**
     * setExecutions
     *
     * @param executions - List
     * @returns void
     */
    setExecutions(executions: Array<any>): void;

    /**
     * setExternallyTerminated
     *
     * @param externallyTerminated - boolean
     * @returns void
     */
    setExternallyTerminated(externallyTerminated: boolean): void;

    /**
     * setId
     *
     * @param id - String
     * @returns void
     */
    setId(id: string): void;

    /**
     * setIgnoreAsync
     *
     * @param ignoreAsync - boolean
     * @returns void
     */
    setIgnoreAsync(ignoreAsync: boolean): void;

    /**
     * setListenerIndex
     *
     * @param listenerIndex - int
     * @returns void
     */
    setListenerIndex(listenerIndex: number): void;

    /**
     * setNextActivity
     *
     * @param nextActivity - PvmActivity
     * @returns void
     */
    setNextActivity(nextActivity: PvmActivity): void;

    /**
     * setParent
     *
     * @param parent - PvmExecutionImpl
     * @returns void
     */
    setParent(parent: PvmExecutionImpl): void;

    /**
     * setParentExecution
     *
     * @param parent - PvmExecutionImpl
     * @returns void
     */
    setParentExecution(parent: PvmExecutionImpl): void;

    /**
     * setParentId
     *
     * @param parentId - String
     * @returns void
     */
    setParentId(parentId: string): void;

    /**
     * setPayloadForTriggeredScope
     *
     * @param payloadForTriggeredScope - Map
     * @returns void
     */
    setPayloadForTriggeredScope(payloadForTriggeredScope: Map<any, any>): void;

    /**
     * setPreserveScope
     *
     * @param preserveScope - boolean
     * @returns void
     */
    setPreserveScope(preserveScope: boolean): void;

    /**
     * setProcessBusinessKey
     *
     * @param businessKey - String
     * @returns void
     */
    setProcessBusinessKey(businessKey: string): void;

    /**
     * setProcessDefinition
     *
     * @param processDefinition - ProcessDefinitionImpl
     * @returns void
     */
    setProcessDefinition(processDefinition: ProcessDefinitionImpl): void;

    /**
     * setProcessDefinitionId
     *
     * @param processDefinitionId - String
     * @returns void
     */
    setProcessDefinitionId(processDefinitionId: string): void;

    /**
     * setProcessDefinitionKey
     *
     * @param processDefinitionKey - String
     * @returns void
     */
    setProcessDefinitionKey(processDefinitionKey: string): void;

    /**
     * setProcessInstance
     *
     * @param pvmExecutionImpl - PvmExecutionImpl
     * @returns void
     */
    setProcessInstance(pvmExecutionImpl: PvmExecutionImpl): void;

    /**
     * setProcessInstanceId
     *
     * @param processInstanceId - String
     * @returns void
     */
    setProcessInstanceId(processInstanceId: string): void;

    /**
     * setProcessInstanceStarting
     *
     * @param starting - boolean
     * @returns void
     */
    setProcessInstanceStarting(starting: boolean): void;

    /**
     * setRestartedProcessInstanceId
     *
     * @param restartedProcessInstanceId - String
     * @returns void
     */
    setRestartedProcessInstanceId(restartedProcessInstanceId: string): void;

    /**
     * setRevision
     *
     * @param revision - int
     * @returns void
     */
    setRevision(revision: number): void;

    /**
     * setRootProcessInstanceId
     *
     * @param rootProcessInstanceId - String
     * @returns void
     */
    setRootProcessInstanceId(rootProcessInstanceId: string): void;

    /**
     * setScope
     *
     * @param isScope - boolean
     * @returns void
     */
    setScope(isScope: boolean): void;

    /**
     * setSequenceCounter
     *
     * @param sequenceCounter - long
     * @returns void
     */
    setSequenceCounter(sequenceCounter: number): void;

    /**
     * setSkipCustomListeners
     *
     * @param skipCustomListeners - boolean
     * @returns void
     */
    setSkipCustomListeners(skipCustomListeners: boolean): void;

    /**
     * setSkipIoMappings
     *
     * @param skipIoMappings - boolean
     * @returns void
     */
    setSkipIoMappings(skipIoMappings: boolean): void;

    /**
     * setSkipSubprocesseses
     *
     * @param skipSubprocesses - boolean
     * @returns void
     */
    setSkipSubprocesseses(skipSubprocesses: boolean): void;

    /**
     * setStartContext
     *
     * @param startContext - ScopeInstantiationContext
     * @returns void
     */
    setStartContext(startContext: ScopeInstantiationContext): void;

    /**
     * setStarting
     *
     * @param isStarting - boolean
     * @returns void
     */
    setStarting(isStarting: boolean): void;

    /**
     * setSubCaseInstance
     *
     * @param subCaseInstance - CmmnExecution
     * @returns void
     */
    setSubCaseInstance(subCaseInstance: CmmnExecution): void;

    /**
     * setSubProcessInstance
     *
     * @param subProcessInstance - PvmExecutionImpl
     * @returns void
     */
    setSubProcessInstance(subProcessInstance: PvmExecutionImpl): void;

    /**
     * setSuperCaseExecution
     *
     * @param superCaseExecution - CmmnExecution
     * @returns void
     */
    setSuperCaseExecution(superCaseExecution: CmmnExecution): void;

    /**
     * setSuperCaseExecutionId
     *
     * @param superCaseExecutionId - String
     * @returns void
     */
    setSuperCaseExecutionId(superCaseExecutionId: string): void;

    /**
     * setSuperExecution
     *
     * @param superExecution - PvmExecutionImpl
     * @returns void
     */
    setSuperExecution(superExecution: PvmExecutionImpl): void;

    /**
     * setSuperExecutionId
     *
     * @param superExecutionId - String
     * @returns void
     */
    setSuperExecutionId(superExecutionId: string): void;

    /**
     * setSuspensionState
     *
     * @param suspensionState - int
     * @returns void
     */
    setSuspensionState(suspensionState: number): void;

    /**
     * setTenantId
     *
     * @param tenantId - String
     * @returns void
     */
    setTenantId(tenantId: string): void;

    /**
     * setTransition
     *
     * @param transition - PvmTransition
     * @returns void
     */
    setTransition(transition: PvmTransition): void;

    /**
     * setTransitionsToTake
     *
     * @param transitionsToTake - List
     * @returns void
     */
    setTransitionsToTake(transitionsToTake: Array<any>): void;

    /**
     * setVariable
     *
     * @param variableName - String
     * @param value - Object
     * @param activityId - String
     * @returns void
     */
    setVariable(variableName: string, value: any, activityId: string): void;

    /**
     * setVariable
     *
     * @param variableName - String
     * @param value - Object
     * @param skipJavaSerializationFormatCheck - boolean
     * @returns void
     */
    setVariable(variableName: string, value: any, skipJavaSerializationFormatCheck: boolean): void;

    /**
     * setVariable
     *
     * @param variableName - String
     * @param value - Object
     * @returns void
     */
    setVariable(variableName: string, value: any): void;

    /**
     * setVariableLocal
     *
     * @param variableName - String
     * @param value - Object
     * @returns void
     */
    setVariableLocal(variableName: string, value: any): void;

    /**
     * setVariableLocal
     *
     * @param variableName - String
     * @param value - TypedValue
     * @param sourceActivityExecution - AbstractVariableScope
     * @param skipJavaSerializationFormatCheck - boolean
     * @returns void
     */
    setVariableLocal(variableName: string, value: TypedValue, sourceActivityExecution: AbstractVariableScope, skipJavaSerializationFormatCheck: boolean): void;

    /**
     * setVariableLocal
     *
     * @param variableName - String
     * @param value - Object
     * @param skipJavaSerializationFormatCheck - boolean
     * @returns void
     */
    setVariableLocal(variableName: string, value: any, skipJavaSerializationFormatCheck: boolean): void;

    /**
     * setVariables
     *
     * @param variables - Map
     * @returns void
     */
    setVariables(variables: Map<any, any>): void;

    /**
     * setVariables
     *
     * @param variables - Map
     * @param skipJavaSerializationFormatCheck - boolean
     * @returns void
     */
    setVariables(variables: Map<any, any>, skipJavaSerializationFormatCheck: boolean): void;

    /**
     * setVariablesLocal
     *
     * @param variables - Map
     * @param skipJavaSerializationFormatCheck - boolean
     * @returns void
     */
    setVariablesLocal(variables: Map<any, any>, skipJavaSerializationFormatCheck: boolean): void;

    /**
     * setVariablesLocal
     *
     * @param variables - Map
     * @returns void
     */
    setVariablesLocal(variables: Map<any, any>): void;

    /**
     * signal
     *
     * @param string - String
     * @param signalData - Object
     * @returns void
     */
    signal(string: string, signalData: any): void;

    /**
     * start
     *
     * @param variables - Map
     * @param formProperties - VariableMap
     * @returns void
     */
    start(variables: Map<any, any>, formProperties: VariableMap): void;

    /**
     * start
     *
     * @param formProperties - Map
     * @returns void
     */
    start(formProperties: Map<any, any>): void;

    /**
     * start
     * @returns void
     */
    start(): void;

    /**
     * startWithFormProperties
     *
     * @param formProperties - VariableMap
     * @returns void
     */
    startWithFormProperties(formProperties: VariableMap): void;

    /**
     * startWithoutExecuting
     *
     * @param variables - Map
     * @returns void
     */
    startWithoutExecuting(variables: Map<any, any>): void;

    /**
     * take
     * @returns void
     */
    take(): void;

    /**
     * toString
     * @returns String
     */
    toString(): string;

    /**
     * tryPruneLastConcurrentChild
     * @returns boolean
     */
    tryPruneLastConcurrentChild(): boolean;

    /**
     * wait
     *
     * @param timeout - long
     * @returns void
     * @throws java.lang.InterruptedException
     */
    wait(timeout: number): void;

    /**
     * wait
     *
     * @param timeout - long
     * @param nanos - int
     * @returns void
     * @throws java.lang.InterruptedException
     */
    wait(timeout: number, nanos: number): void;

    /**
     * wait
     * @returns void
     * @throws java.lang.InterruptedException
     */
    wait(): void;

}

type VariableMap = Map<string, any>;
type VariableMapImpl = Map<string, any>;
type TypedValue = any;

type ExecutionEntity = DelegateExecution;
type PvmExecutionImpl = DelegateExecution;
type ActivityExecution = DelegateExecution;
type PvmExecution = DelegateExecution;

type ProcessDefinitionImpl = any;
type ProcessDefinitionEntity = any;
type PvmProcessDefinition = any;

type ActivityImpl = any;
type PvmActivity = any;
type PvmScope = any;

type ProcessEngineServices = any;
type ProcessEngine = any;
type BpmnModelInstance = any;
type FlowElement = any;
type Incident = any;
type IncidentEntity = any;
type IncidentHandler = any;

type EventSubscriptionEntity = any;
type VariableInstanceEntity = any;
type CoreVariableInstance = any;
type VariableInstanceLifecycleListener = any;
type VariableEvent = any;
type DelayedVariableEvent = any;

type TaskEntity = any;
type JobEntity = any;
type ExternalTaskEntity = any;

type DelegateListener = any;
type ExecutionObserver = any;

type CaseExecutionEntity = any;
type CmmnExecution = any;
type CmmnCaseInstance = any;
type CmmnCaseDefinition = any;

type AbstractVariableScope = any;
type ScopeImpl = any;
type ScopeInstantiationContext = any;
type CoreModelElement = any;

type PvmTransition = any;
type TransitionImpl = any;
type AtomicOperation = any;
type CoreAtomicOperation = any;
type PvmAtomicOperation = any;
type AtomicOperationInvocation = any;

type ActivityInstanceState = any;
type Callback = any;
type ELContext = any;
type PvmProcessInstance = any;
