import{importShared as v}from"./__federation_fn_import-BiZbvQNN.js";import{r as S}from"./index-CtmpQeow.js";var y={exports:{}},f={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var D=S,I=Symbol.for("react.element"),R=Symbol.for("react.fragment"),$=Object.prototype.hasOwnProperty,F=D.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,P={key:!0,ref:!0,__self:!0,__source:!0};function w(l,t,n){var s,d={},c=null,o=null;n!==void 0&&(c=""+n),t.key!==void 0&&(c=""+t.key),t.ref!==void 0&&(o=t.ref);for(s in t)$.call(t,s)&&!P.hasOwnProperty(s)&&(d[s]=t[s]);if(l&&l.defaultProps)for(s in t=l.defaultProps,t)d[s]===void 0&&(d[s]=t[s]);return{$$typeof:I,type:l,key:c,ref:o,props:d,_owner:F.current}}f.Fragment=R;f.jsx=w;f.jsxs=w;y.exports=f;var e=y.exports;const{useMemo:_,useState:p}=await v("react"),{gql:h,useMutation:g,useQuery:N}=await v("@apollo/client"),C=h`
  query ProjectsByUser {
    projectsByUser {
      id
      title
      description
      createdAt
    }
  }
`,A=h`
  query FeatureRequests($projectId: ID!) {
    featureRequests(projectId: $projectId) {
      id
      title
      description
      status
      createdAt
    }
  }
`,q=h`
  query DraftsByFeature($featureId: ID!) {
    draftsByFeature(featureId: $featureId) {
      id
      content
      version
      createdAt
    }
  }
`,E=h`
  mutation CreateProject($title: String!, $description: String!) {
    createProject(title: $title, description: $description) {
      id
      title
      description
      createdAt
    }
  }
`,T=h`
  mutation AddFeature($projectId: ID!, $title: String!, $description: String!) {
    addFeatureRequest(projectId: $projectId, title: $title, description: $description) {
      id
      title
      description
      status
      createdAt
    }
  }
`,O=h`
  mutation SubmitDraft($featureId: ID!, $content: String!) {
    submitDraft(featureId: $featureId, content: $content) {
      id
      content
      version
      createdAt
    }
  }
`,J=()=>{const{data:l,loading:t,refetch:n}=N(C),[s]=g(E,{onCompleted:()=>n()}),[d,c]=p(null),[o,m]=p(""),[u,a]=p(""),x=l?.projectsByUser??[],j=_(()=>x.find(r=>r.id===d)??null,[x,d]),b=async r=>{r.preventDefault(),o.trim()&&(await s({variables:{title:o,description:u}}),m(""),a(""))};return e.jsx("div",{className:"min-h-screen bg-slate-50",children:e.jsxs("div",{className:"max-w-6xl mx-auto px-6 py-8 space-y-6",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm uppercase tracking-wider text-slate-500",children:"Remote"}),e.jsx("h1",{className:"text-3xl font-semibold text-slate-900",children:"Projects"}),e.jsx("p",{className:"text-slate-600 mt-2",children:"Create projects, add feature requests, and submit implementation drafts."})]}),e.jsxs("div",{className:"grid lg:grid-cols-3 gap-5",children:[e.jsxs("div",{className:"lg:col-span-1 space-y-4",children:[e.jsxs("div",{className:"rounded-lg border border-slate-200 bg-white p-4 shadow-sm",children:[e.jsx("h3",{className:"text-sm font-semibold text-slate-800 mb-3",children:"New Project"}),e.jsxs("form",{className:"space-y-2",onSubmit:b,children:[e.jsx("input",{value:o,onChange:r=>m(r.target.value),placeholder:"Title",required:!0,className:"w-full rounded-md border border-slate-300 px-3 py-2 text-sm"}),e.jsx("textarea",{value:u,onChange:r=>a(r.target.value),placeholder:"Description",className:"w-full rounded-md border border-slate-300 px-3 py-2 text-sm",rows:3}),e.jsx("button",{type:"submit",className:"w-full rounded-md bg-slate-900 text-white py-2 text-sm hover:bg-slate-800",children:"Create"})]})]}),e.jsxs("div",{className:"rounded-lg border border-slate-200 bg-white p-4 shadow-sm",children:[e.jsx("h3",{className:"text-sm font-semibold text-slate-800 mb-3",children:"Your Projects"}),t?e.jsx("p",{className:"text-sm text-slate-600",children:"Loading..."}):x.length===0?e.jsx("p",{className:"text-sm text-slate-600",children:"No projects yet."}):e.jsx("ul",{className:"space-y-2",children:x.map(r=>e.jsx("li",{children:e.jsxs("button",{onClick:()=>c(r.id),className:`w-full text-left rounded-md border px-3 py-2 text-sm ${d===r.id?"border-slate-900 bg-slate-900 text-white":"border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300"}`,children:[e.jsx("div",{className:"font-semibold",children:r.title}),e.jsx("div",{className:"text-xs text-slate-600",children:r.description})]})},r.id))})]})]}),e.jsx("div",{className:"lg:col-span-2 space-y-4",children:j?e.jsx(k,{projectId:j.id,title:j.title}):e.jsx("div",{className:"rounded-lg border border-dashed border-slate-300 bg-white p-6 text-slate-600",children:"Select a project to manage feature requests and drafts."})})]})]})})},k=({projectId:l,title:t})=>{const{data:n,loading:s,refetch:d}=N(A,{variables:{projectId:l}}),[c]=g(T,{onCompleted:()=>d()}),[o,m]=p(""),[u,a]=p(""),[x,j]=p(null),b=n?.featureRequests??[],r=async i=>{i.preventDefault(),await c({variables:{projectId:l,title:o,description:u}}),m(""),a("")};return e.jsxs("div",{className:"space-y-4",children:[e.jsx("div",{className:"flex items-center justify-between",children:e.jsxs("div",{children:[e.jsx("p",{className:"text-sm uppercase tracking-wider text-slate-500",children:"Project"}),e.jsx("h2",{className:"text-2xl font-semibold text-slate-900",children:t})]})}),e.jsxs("div",{className:"rounded-lg border border-slate-200 bg-white p-4 shadow-sm",children:[e.jsx("h3",{className:"text-sm font-semibold text-slate-800 mb-3",children:"Add Feature Request"}),e.jsxs("form",{className:"grid md:grid-cols-3 gap-2",onSubmit:r,children:[e.jsx("input",{value:o,onChange:i=>m(i.target.value),placeholder:"Feature title",required:!0,className:"rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-1"}),e.jsx("input",{value:u,onChange:i=>a(i.target.value),placeholder:"Short description",className:"rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-1"}),e.jsx("button",{type:"submit",className:"rounded-md bg-slate-900 text-white py-2 text-sm hover:bg-slate-800 md:col-span-1",children:"Add"})]})]}),e.jsxs("div",{className:"grid md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"rounded-lg border border-slate-200 bg-white p-4 shadow-sm",children:[e.jsx("h3",{className:"text-sm font-semibold text-slate-800 mb-3",children:"Feature Requests"}),s?e.jsx("p",{className:"text-sm text-slate-600",children:"Loading..."}):b.length===0?e.jsx("p",{className:"text-sm text-slate-600",children:"No feature requests yet."}):e.jsx("ul",{className:"space-y-2",children:b.map(i=>e.jsx("li",{children:e.jsxs("button",{onClick:()=>j(i.id),className:`w-full rounded-md border px-3 py-2 text-left text-sm ${x===i.id?"border-slate-900 bg-slate-900 text-white":"border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300"}`,children:[e.jsx("div",{className:"font-semibold",children:i.title}),e.jsx("div",{className:"text-xs text-slate-600",children:i.description}),e.jsxs("div",{className:"text-[11px] text-slate-500 mt-1",children:["Status: ",i.status]})]})},i.id))})]}),e.jsxs("div",{className:"rounded-lg border border-slate-200 bg-white p-4 shadow-sm",children:[e.jsx("h3",{className:"text-sm font-semibold text-slate-800 mb-3",children:"Drafts"}),x?e.jsx(B,{featureId:x}):e.jsx("p",{className:"text-sm text-slate-600",children:"Select a feature to view drafts."})]})]})]})},B=({featureId:l})=>{const{data:t,loading:n,refetch:s}=N(q,{variables:{featureId:l}}),[d]=g(O,{onCompleted:()=>s()}),[c,o]=p(""),m=t?.draftsByFeature??[],u=async a=>{a.preventDefault(),await d({variables:{featureId:l,content:c}}),o("")};return e.jsxs("div",{className:"space-y-3",children:[e.jsxs("form",{className:"space-y-2",onSubmit:u,children:[e.jsx("textarea",{value:c,onChange:a=>o(a.target.value),placeholder:"Implementation notes or draft",required:!0,className:"w-full rounded-md border border-slate-300 px-3 py-2 text-sm",rows:4}),e.jsx("button",{type:"submit",className:"rounded-md bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800",children:"Submit Draft"})]}),n?e.jsx("p",{className:"text-sm text-slate-600",children:"Loading drafts..."}):m.length===0?e.jsx("p",{className:"text-sm text-slate-600",children:"No drafts yet."}):e.jsx("ul",{className:"space-y-2",children:m.map(a=>e.jsxs("li",{className:"rounded-md border border-slate-200 bg-slate-50 p-3 text-sm",children:[e.jsxs("div",{className:"flex items-center justify-between text-xs text-slate-500 mb-1",children:[e.jsxs("span",{children:["Version ",a.version]}),e.jsx("span",{children:new Date(a.createdAt).toLocaleString()})]}),e.jsx("p",{className:"text-slate-800 whitespace-pre-wrap",children:a.content})]},a.id))})]})};export{J as default,e as j};
