import { useState } from 'react';
import { previewRequests, previewStates } from '../../fixtures/design';
import PanelView from '../ui/PanelView';
import RequestFormView from '../ui/RequestFormView';
import type { PanelContract } from '../../lib/usePanel';
export default function DesignPreview() {
  const [state,setState]=useState<string>('listado');
  const [filters,setFilters]=useState({ from:'',to:'',type:'',page:0 });
  const [selected,setSelected]=useState<PanelContract['selected']>(null);
  const [note,setNote]=useState('');
  const filtered=previewRequests.filter(row=>(!filters.type||row.request_type===filters.type)&&(!filters.from||row.created_at.slice(0,10)>=filters.from)&&(!filters.to||row.created_at.slice(0,10)<=filters.to));
  const sampleOnly=()=>setNote('Demostración visual: esta acción no inicia sesión, envía ni modifica datos.');
  const contract: PanelContract={
    access:state==='login'?'login':state==='recuperacion'?'recovery':state==='denegado'?'denied':state==='verificando'?'loading':'authorized',
    rows:state==='vacio'?[]:filtered.slice(filters.page*10,filters.page*10+10), count:state==='vacio'?0:filtered.length, pageSize:10, selected:selected,
    filters,loading:state==='carga',busy:false,message:note,loadError:state==='error'?'Error de ejemplo. Ningún servicio real fue consultado.':'',demo:true,
    onAuth:async event=>{event.preventDefault();sampleOnly();},logout:async ()=>{sampleOnly();},retry:()=>{setState('listado');setNote('Vista de listado de muestra. No se consultó ningún servicio.');},select:setSelected,
    filter:(key,value)=>{setFilters(old=>({...old,[key]:value,page:0}));setSelected(null);},page:page=>{setFilters(old=>({...old,page}));setSelected(null);},
  };
  const formState=state==='form-carga'?'sending':state==='form-error'?'error':state==='form-exito'?'success':'idle';
  return <><div className="preview-banner"><strong>Demostración visual aislada · Datos ficticios.</strong> No hay sesión autenticada, envío ni conexión a servicios. Esta ruta solo existe en desarrollo.</div><div className="preview-controls"><div><label htmlFor="preview-state">Estado de la interfaz</label><select id="preview-state" value={state} onChange={event=>{const value=event.target.value;setState(value);setSelected(value==='detalle'?previewRequests[0]:null);setFilters({from:'',to:'',type:'',page:0});setNote('');}}>{previewStates.map(([key,label])=><option value={key} key={key}>{label}</option>)}</select></div><p>Los controles inferiores solo cambian la muestra. La autenticación y los servicios del proyecto se conservan intactos.</p></div>{state.startsWith('form')?<div className="preview-form"><RequestFormView status={formState} errors={state==='form-error'?{name:'Ingresa tu nombre para continuar.',email:'Ingresa un correo válido.'}:{}} message={state==='form-exito'?'Ejemplo visual del estado de éxito. No se ha guardado ni enviado ninguna solicitud.':state==='form-error'?'Ejemplo de error: revisa los campos indicados.':state==='form-carga'?'Ejemplo visual: guardando… (sin operación real).':note} demo onSubmit={event=>{event.preventDefault();sampleOnly();}}/></div>:<PanelView {...contract}/>}</>;
}
