# User Feature Flows & Upgrade Suggestions

## Overview

This document outlines all user-facing features in Cloud9Profile and recommends where upgrade prompts should be strategically placed to maximize conversions while maintaining a positive user experience.

---

## Current Plan Structure

### Plan IDs (Backend)

- `free`
- `professional`
- `premium`
- `enterprise`

### Plan Limits (from `lib/subscription.ts`)

#### Free Plan

- **Resumes**: 3
- **Portfolios**: 1
- **Cover Letters**: 1
- **Portfolio Publishing**: 30 days
- **Watermark**: Yes (on PDF exports)
- **AI Features**: Yes (limited by credits)
- **Starting Credits**: 5 + 25 welcome bonus = 30 credits

#### Professional Plan

- **Resumes**: Unlimited
- **Portfolios**: 5
- **Cover Letters**: Unlimited
- **Portfolio Publishing**: Unlimited
- **Watermark**: No
- **AI Features**: Yes
- **Monthly Credits**: 200 credits

#### Premium Plan

- **Resumes**: Unlimited
- **Portfolios**: Unlimited
- **Cover Letters**: Unlimited
- **Additional**: Custom domain, interview prep, LinkedIn optimization
- **Monthly Credits**: 500 credits

---

## Credit Costs (from `lib/subscription.ts`)

```
resume_download_pdf: 1 credit
portfolio_publish: 5 credits
portfolio_update: 1 credit
ai_generation: 2 credits
ai_fix: 1 credit
cover_letter_generation: 5 credits
ats_analysis: 5 credits
ats_auto_apply: 5 credits
portfolio_ai_generation: 10 credits
```

---

## Feature Flows & Upgrade Opportunities

### 1. **Resume Builder** (`/dashboard/resume`)

#### Current Flow

- List all resumes
- Create new resume
- Edit/Preview/Delete resumes
- **NO PLAN LIMIT CHECK** ❌

#### Upgrade Opportunities

**Priority: HIGH** 🔴

**Missing Implementation:**

- [ ] Check resume count vs plan limit when creating new resume
- [ ] Show upgrade modal when free users reach 3 resumes
- [ ] Display "X of 3 resumes used" indicator for free users

**Suggested Changes:**

```tsx
// In pages/dashboard/resumes.tsx
const handleCreateResume = async () => {
  // Check plan limit
  if (userPlan === "free" && resumes.length >= 3) {
    setShowUpgradeModal(true);
    setUpgradeReason("resume_limit");
    return;
  }
  // ... proceed with creation
};
```

**UI Enhancements:**

- Add progress indicator: "2 of 3 resumes used" (free plan)
- Show "Unlock unlimited resumes" CTA button
- Display feature comparison table in upgrade modal

---

### 2. **PDF Resume Download** (`components/ResumePreviewModal.tsx`)

#### Current Flow

- Downloads are credit-based (1 credit per download)
- Shows credit confirmation modal before download
- **Watermark on free plan** ✅

#### Upgrade Opportunities

**Priority: MEDIUM** 🟡

**Existing Implementation:**

- ✅ Credit cost warning
- ✅ Watermark indicator (presumably)
- ❓ No explicit "remove watermark" upgrade prompt

**Suggested Enhancements:**

- [ ] After download, show tooltip/banner: "Remove watermark with Pro plan"
- [ ] Add "Preview without watermark" feature comparison
- [ ] Track download count and show upgrade after 3-5 downloads

---

### 3. **ATS Checker** (`components/ai/ATSChecker.tsx`)

#### Current Flow

- Analyze resume: 5 credits
- Auto-apply suggestions: 5 credits
- Credit confirmation before analysis
- **Has upgrade modal integration** ✅

#### Upgrade Opportunities

**Priority: LOW** 🟢

**Existing Implementation:**

- ✅ Credit confirmation modal
- ✅ Upgrade modal when insufficient credits

**Suggested Enhancements:**

- [ ] Highlight ATS feature in Professional plan benefits
- [ ] Show"Advanced ATS insights" as Pro-only feature
- [ ] Add comparison: "Free: Basic ATS | Pro: Advanced ATS + Recommendations"

---

### 4. **Cover Letter Generator** (`/dashboard/cover-letters`)

#### Current Flow

- **Costs 5 credits per generation**
- **Free plan limit: 1 cover letter** ⚠️
- **NO IMPLEMENTATION FOUND** ❌

#### Upgrade Opportunities

**Priority: HIGH** 🔴

**Missing Implementation:**

- [ ] No page found at `/dashboard/cover-letters` route
- [ ] No cover letter creation flow
- [ ] No limit checking

**Required Implementation:**

```tsx
// Create pages/dashboard/cover-letters.tsx
- Check cover letter count vs plan limit
- Show upgrade modal when free users try to create 2nd letter
- Display "Unlimited cover letters with Pro" banner
```

---

### 5. **Portfolio Builder** (`/dashboard/portfolio`)

#### Current Flow

- Shows upgrade modal when limits reached ✅
- Has plan limit checking ✅
- Publishing costs 5 credits

#### Upgrade Opportunities

**Priority: LOW** 🟢

**Existing Implementation:**

- ✅ `showUpgradeModal` state exists
- ✅ Portfolio limits enforced

**Suggested Enhancements:**

- [ ] Show portfolio expiration warning for free users (30 days)
- [ ] "Publish forever with Pro" CTA on portfolio cards
- [ ] Highlight custom domain feature for Premium plan

---

### 6. **AI Resume Generation** (`components/ai/ResumeUploader.tsx`)

#### Current Flow

- AI generation costs 2 credits
- Has upgrade modal integration ✅

#### Upgrade Opportunities

**Priority: MEDIUM** 🟡

**Existing Implementation:**

- ✅ Credit cost displayed
- ✅ Upgrade modal integration

**Suggested Enhancements:**

- [ ] "Generate more with Pro (200 credits/month)" message
- [ ] Show credit refill date for free users
- [ ] Highlight AI features in upgrade modal

---

### 7. **Portfolio AI Generation** (`/dashboard/portfolio/[id]/edit`)

#### Current Flow

- Costs 10 credits (highest cost feature)
- Has credit confirmation

#### Upgrade Opportunities

**Priority: MEDIUM** 🟡

**Suggested Enhancements:**

- [ ] After generation, suggest "Generate unlimited portfolios with Premium"
- [ ] Show credits remaining vs Pro plan allowance
- [ ] Add "Upgrade to Premium for unlimited AI generations"

---

### 8. **Dashboard Sidebar** (`pages/_app.tsx`)

#### Current Flow

- Shows plan badge
- Shows credit balance with progress bar
- "Upgrade to Pro" button for free users only ✅

#### Upgrade Opportunities

##Priority: LOW\*\* 🟢

**Existing Implementation:**

- ✅ Plan displayed
- ✅ Credits shown
- ✅ Upgrade CTA for free plan

**Suggested Enhancements:**

- [ ] Show "Credits reset in X days" for paid plans
- [ ] Add sparkle animation to upgrade button
- [ ] Show most popular plan badge

---

## 📋 Comprehensive Upgrade Prompt Checklist

### **Critical Missing Features** ❌

1. **Resume Creation Limit** - No enforcement on free plan's 3 resume limit
2. **Cover Letter Flow** - Entire feature appears missing/not accessible
3. **Watermark Upgrade Prompt** - No explicit "remove watermark" CTA after downloads

### **Recommended New Upgrade Triggers** 💡

#### High Priority

- [ ] Resume creation limit reached (3 resumes)
- [ ] Cover letter limit reached (1 letter)
- [ ] PDF download with watermark notice
- [ ] Portfolio expiry warning (25 days for free users)

#### Medium Priority

- [ ] After 5 AI generations, suggest more credits
- [ ] Low credits warning (\u003c10 credits)
- [ ] After ATS analysis, suggest advanced features

#### Low Priority

- [ ] Template selection (show Pro-only templates)
- [ ] Font customization (Pro feature)
- [ ] Custom branding options

---

## 🎯 Strategic Placement Recommendations

### **Non-Intrusive Prompts** (Recommended)

1. **Banner Notifications**
   - Above resume/portfolio lists
   - In preview mode headers
   - After successful actions

2. **Inline CTAs**
   - Within feature cards
   - Below usage statistics
   - In empty states

3. **Feature Locks**
   - Disabled buttons with tooltips
   - "Pro" badges on premium templates
   - Grayed-out advanced options

### **Modal Prompts** (Use Sparingly)

1. **Hard Limits Only**
   - Cannot create more items
   - Insufficient credits for action
   - Portfolio expiration

2. **After Valuable Actions**
   - Completing first resume
   - Successful ATS optimization
   - Portfolio published successfully

---

## 🔧 Implementation Priority

### Phase 1: Critical Fixes (Fix Admin Panel & Essential Flows)

1. Fix admin panel "pro" → "professional" bug
2. Implement resume creation limit checking
3. Create cover letter feature or remove from limits

### Phase 2: Add Coupon System

1. Add coupon UI to `PlanUpgradeModal`
2. Update checkout to accept discount codes
3. Test coupon application flow

### Phase 3: Enhance Upgrade Prompts

1. Add usage indicators to all resource lists
2. Implement watermark upgrade prompts
3. Add portfolio expiry warnings
4. Create low-credit warnings

### Phase 4: Optimize Conversion

1. A/B test modal vs banner prompts
2. Add social proof to upgrade modals
3. Implement feature comparison tooltips
4. Track upgrade funnel analytics

---

## 📊 Metrics to Track

### User Engagement

- Feature usage by plan type
- Credit consumption patterns
- Upgrade modal show rate
- Conversion rate by trigger type

### Revenue Optimization

- Most effective upgrade trigger
- Average time to conversion
- Coupon usage rate
- Upgrade path analysis

---

## ✅ Testing Checklist

### Manual Testing Required

- [ ] Test resume creation limit as free user
- [ ] Test portfolio creation limit as free user
- [ ] Test cover letter limit (if exists)
- [ ] Test watermark on free plan PDFs
- [ ] Test credit deduction for each feature
- [ ] Test upgrade modal triggers
- [ ] Test coupon code application
- [ ] Test admin panel plan updates
- [ ] Verify plan limits for pro/premium users
- [ ] Test credit top-up flow

### Edge Cases

- [ ] What happens at exactly 3 resumes?
- [ ] Can free users edit existing resumes after limit?
- [ ] What if user has 0 credits?
- [ ] Portfolio expiry notification timing
- [ ] Multiple simultaneous upgrade modals

---

## 🐛 Known Issues

1. **Admin Panel Bug**: Uses `"pro"` instead of `"professional"` ❌
2. **Cover Letters**: Route exists but no implementation found ⚠️
3. **Resume Limits**: Not enforced in resumes.tsx ❌
4. **Plan Consistency**: `lib/subscription.ts` uses "pro" but API uses "professional" ⚠️

---

**Last Updated**: 2026-02-03
**Next Review**: After Phase 2 completion
