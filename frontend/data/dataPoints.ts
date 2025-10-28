// Data Points Configuration for Each Report Type

import { DataPoint } from '@/types/blueprint.types';

export const COMPETITOR_ANALYSIS_DATA_POINTS: DataPoint[] = [
  {
    id: 'traffic_seo',
    label: 'Traffic & SEO',
    subOptions: [
      { id: 'organic_traffic', label: 'Organic Traffic (Google Search)' },
      { id: 'traffic_trends', label: 'Traffic trends' },
      { id: 'top_keywords', label: 'Top keywords' },
      { id: 'backlink_profile', label: 'Backlink profile' },
      { id: 'domain_authority', label: 'Domain authority' },
    ],
  },
  {
    id: 'paid_search',
    label: 'Paid Search (Google Ads)',
    subOptions: [
      { id: 'ad_spend_estimates', label: 'Ad spend estimates' },
      { id: 'top_ad_keywords', label: 'Top ad keywords' },
      { id: 'ad_copy_analysis', label: 'Ad copy analysis' },
    ],
  },
  {
    id: 'social_media_traffic',
    label: 'Social Media Traffic',
    subOptions: [
      { id: 'traffic_from_social', label: 'Traffic from social platforms' },
      { id: 'social_referrals', label: 'Social referrals analysis' },
    ],
  },
  {
    id: 'website_analysis',
    label: 'Website Analysis',
    subOptions: [
      { id: 'site_structure', label: 'Site structure' },
      { id: 'page_speed', label: 'Page speed' },
      { id: 'mobile_optimization', label: 'Mobile optimization' },
      { id: 'user_experience', label: 'User experience' },
    ],
  },
  {
    id: 'social_media_presence',
    label: 'Social Media Presence',
    subOptions: [
      { id: 'follower_growth', label: 'Follower growth' },
      { id: 'engagement_rates', label: 'Engagement rates' },
      { id: 'content_strategy', label: 'Content strategy' },
      { id: 'platform_comparison', label: 'Platform comparison' },
    ],
  },
  {
    id: 'content_strategy',
    label: 'Content Strategy',
    subOptions: [
      { id: 'blog_frequency', label: 'Blog frequency' },
      { id: 'content_topics', label: 'Content topics' },
      { id: 'content_performance', label: 'Content performance' },
    ],
  },
  {
    id: 'social_advertising',
    label: 'Social Advertising',
    subOptions: [
      { id: 'facebook_instagram_ads', label: 'Facebook/Instagram ads' },
      { id: 'linkedin_ads', label: 'LinkedIn ads' },
      { id: 'twitter_ads', label: 'Twitter/X ads' },
      { id: 'ad_creative_analysis', label: 'Ad creative analysis' },
    ],
  },
  {
    id: 'display_advertising',
    label: 'Display Advertising',
    subOptions: [
      { id: 'banner_ads', label: 'Banner ads' },
      { id: 'programmatic_buying', label: 'Programmatic buying' },
      { id: 'ad_networks', label: 'Ad networks used' },
    ],
  },
  {
    id: 'market_position',
    label: 'Market Position',
    subOptions: [
      { id: 'market_share', label: 'Market share estimates' },
      { id: 'pricing_strategy', label: 'Pricing strategy' },
      { id: 'target_audience', label: 'Target audience' },
    ],
  },
  {
    id: 'product_portfolio',
    label: 'Product Portfolio',
    subOptions: [
      { id: 'product_range', label: 'Product range' },
      { id: 'feature_comparison', label: 'Feature comparison' },
      { id: 'pricing_comparison', label: 'Pricing comparison' },
    ],
  },
  {
    id: 'customer_sentiment',
    label: 'Customer Sentiment',
    subOptions: [
      { id: 'reviews_analysis', label: 'Reviews analysis' },
      { id: 'brand_perception', label: 'Brand perception' },
      { id: 'customer_complaints', label: 'Customer complaints' },
    ],
  },
  {
    id: 'revenue_estimates',
    label: 'Revenue Estimates',
    subOptions: [
      { id: 'revenue_trends', label: 'Revenue trends' },
      { id: 'revenue_by_segment', label: 'Revenue by segment' },
    ],
  },
  {
    id: 'funding_history',
    label: 'Funding History',
    subOptions: [
      { id: 'funding_rounds', label: 'Funding rounds' },
      { id: 'investors', label: 'Investors' },
      { id: 'valuation', label: 'Valuation' },
    ],
  },
  {
    id: 'growth_metrics',
    label: 'Growth Metrics',
    subOptions: [
      { id: 'yoy_growth', label: 'Year-over-year growth' },
      { id: 'user_growth', label: 'User growth' },
      { id: 'market_expansion', label: 'Market expansion' },
    ],
  },
  {
    id: 'team_hiring',
    label: 'Team Size & Hiring Trends',
    subOptions: [
      { id: 'employee_count', label: 'Employee count' },
      { id: 'hiring_trends', label: 'Hiring trends' },
      { id: 'key_positions', label: 'Key positions' },
    ],
  },
];

export const BUSINESS_PERFORMANCE_DATA_POINTS: DataPoint[] = [
  {
    id: 'website_analytics',
    label: 'Website Analytics',
    subOptions: [
      { id: 'traffic_overview', label: 'Traffic overview' },
      { id: 'conversion_rates', label: 'Conversion rates' },
      { id: 'bounce_rate', label: 'Bounce rate' },
      { id: 'session_duration', label: 'Session duration' },
    ],
  },
  {
    id: 'sales_performance',
    label: 'Sales Performance',
    subOptions: [
      { id: 'revenue_trends', label: 'Revenue trends' },
      { id: 'sales_by_channel', label: 'Sales by channel' },
      { id: 'customer_acquisition_cost', label: 'Customer acquisition cost' },
      { id: 'lifetime_value', label: 'Customer lifetime value' },
    ],
  },
  {
    id: 'marketing_roi',
    label: 'Marketing ROI',
    subOptions: [
      { id: 'campaign_performance', label: 'Campaign performance' },
      { id: 'channel_attribution', label: 'Channel attribution' },
      { id: 'cost_per_acquisition', label: 'Cost per acquisition' },
    ],
  },
  {
    id: 'seo_performance',
    label: 'SEO Performance',
    subOptions: [
      { id: 'keyword_rankings', label: 'Keyword rankings' },
      { id: 'organic_growth', label: 'Organic growth' },
      { id: 'technical_seo_health', label: 'Technical SEO health' },
    ],
  },
  {
    id: 'paid_campaigns',
    label: 'Paid Campaigns',
    subOptions: [
      { id: 'google_ads_performance', label: 'Google Ads performance' },
      { id: 'social_ads_performance', label: 'Social ads performance' },
      { id: 'roas_analysis', label: 'ROAS analysis' },
    ],
  },
  {
    id: 'social_media_performance',
    label: 'Social Media Performance',
    subOptions: [
      { id: 'engagement_metrics', label: 'Engagement metrics' },
      { id: 'follower_growth', label: 'Follower growth' },
      { id: 'content_performance', label: 'Content performance' },
    ],
  },
  {
    id: 'customer_demographics',
    label: 'Customer Demographics',
    subOptions: [
      { id: 'age_gender', label: 'Age and gender distribution' },
      { id: 'geographic_location', label: 'Geographic location' },
      { id: 'device_usage', label: 'Device usage' },
    ],
  },
  {
    id: 'customer_behavior',
    label: 'Customer Behavior',
    subOptions: [
      { id: 'purchase_patterns', label: 'Purchase patterns' },
      { id: 'browsing_behavior', label: 'Browsing behavior' },
      { id: 'engagement_frequency', label: 'Engagement frequency' },
    ],
  },
  {
    id: 'retention_metrics',
    label: 'Retention Metrics',
    subOptions: [
      { id: 'repeat_purchase_rate', label: 'Repeat purchase rate' },
      { id: 'customer_loyalty', label: 'Customer loyalty score' },
      { id: 'retention_cohorts', label: 'Retention cohorts' },
    ],
  },
  {
    id: 'churn_analysis',
    label: 'Churn Analysis',
    subOptions: [
      { id: 'churn_rate', label: 'Churn rate' },
      { id: 'churn_reasons', label: 'Churn reasons' },
      { id: 'at_risk_customers', label: 'At-risk customers' },
    ],
  },
];

export const NEW_PARTNERS_DATA_POINTS: DataPoint[] = [
  {
    id: 'industry_leaders',
    label: 'Industry Leaders',
    subOptions: [
      { id: 'top_companies', label: 'Top companies in industry' },
      { id: 'market_leaders', label: 'Market leaders analysis' },
      { id: 'emerging_players', label: 'Emerging players' },
    ],
  },
  {
    id: 'complementary_services',
    label: 'Complementary Services',
    subOptions: [
      { id: 'service_alignment', label: 'Service alignment' },
      { id: 'value_proposition', label: 'Value proposition match' },
      { id: 'customer_overlap', label: 'Customer overlap' },
    ],
  },
  {
    id: 'geographic_coverage',
    label: 'Geographic Coverage',
    subOptions: [
      { id: 'regional_presence', label: 'Regional presence' },
      { id: 'expansion_plans', label: 'Expansion plans' },
      { id: 'market_penetration', label: 'Market penetration' },
    ],
  },
  {
    id: 'tech_stack_compatibility',
    label: 'Technology Stack Compatibility',
    subOptions: [
      { id: 'platform_compatibility', label: 'Platform compatibility' },
      { id: 'integration_capabilities', label: 'Integration capabilities' },
      { id: 'api_availability', label: 'API availability' },
    ],
  },
  {
    id: 'company_profile',
    label: 'Company Profile',
    subOptions: [
      { id: 'company_size', label: 'Company size' },
      { id: 'revenue', label: 'Revenue estimates' },
      { id: 'market_presence', label: 'Market presence' },
      { id: 'reputation', label: 'Reputation analysis' },
    ],
  },
  {
    id: 'partnership_potential',
    label: 'Partnership Potential',
    subOptions: [
      { id: 'synergy_analysis', label: 'Synergy analysis' },
      { id: 'mutual_benefits', label: 'Mutual benefits' },
      { id: 'risk_assessment', label: 'Risk assessment' },
    ],
  },
  {
    id: 'contact_information',
    label: 'Contact Information',
    subOptions: [
      { id: 'decision_makers', label: 'Key decision makers' },
      { id: 'contact_channels', label: 'Contact channels' },
      { id: 'previous_partnerships', label: 'Previous partnerships' },
    ],
  },
  {
    id: 'financial_stability',
    label: 'Financial Stability',
    subOptions: [
      { id: 'funding_status', label: 'Funding status' },
      { id: 'profitability', label: 'Profitability' },
      { id: 'growth_trajectory', label: 'Growth trajectory' },
    ],
  },
  {
    id: 'cultural_fit',
    label: 'Cultural Fit',
    subOptions: [
      { id: 'company_values', label: 'Company values' },
      { id: 'work_style', label: 'Work style' },
      { id: 'communication_style', label: 'Communication style' },
    ],
  },
  {
    id: 'legal_compliance',
    label: 'Legal & Compliance',
    subOptions: [
      { id: 'regulatory_compliance', label: 'Regulatory compliance' },
      { id: 'certifications', label: 'Certifications' },
      { id: 'legal_history', label: 'Legal history' },
    ],
  },
];

export const MARKET_TRENDS_DATA_POINTS: DataPoint[] = [
  {
    id: 'industry_growth',
    label: 'Industry Growth',
    subOptions: [
      { id: 'market_size', label: 'Market size estimates' },
      { id: 'growth_rate', label: 'Growth rate trends' },
      { id: 'future_projections', label: 'Future projections' },
    ],
  },
  {
    id: 'consumer_behavior',
    label: 'Consumer Behavior Shifts',
    subOptions: [
      { id: 'buying_patterns', label: 'Buying patterns' },
      { id: 'preference_changes', label: 'Preference changes' },
      { id: 'demographic_shifts', label: 'Demographic shifts' },
    ],
  },
  {
    id: 'technology_trends',
    label: 'Technology Trends',
    subOptions: [
      { id: 'emerging_tech', label: 'Emerging technologies' },
      { id: 'digital_transformation', label: 'Digital transformation' },
      { id: 'automation_trends', label: 'Automation trends' },
    ],
  },
  {
    id: 'competitive_landscape',
    label: 'Competitive Landscape',
    subOptions: [
      { id: 'new_entrants', label: 'New market entrants' },
      { id: 'market_consolidation', label: 'Market consolidation' },
      { id: 'competitive_dynamics', label: 'Competitive dynamics' },
    ],
  },
  {
    id: 'regulatory_changes',
    label: 'Regulatory Changes',
    subOptions: [
      { id: 'new_regulations', label: 'New regulations' },
      { id: 'compliance_requirements', label: 'Compliance requirements' },
      { id: 'policy_impact', label: 'Policy impact analysis' },
    ],
  },
  {
    id: 'economic_factors',
    label: 'Economic Factors',
    subOptions: [
      { id: 'economic_indicators', label: 'Economic indicators' },
      { id: 'inflation_impact', label: 'Inflation impact' },
      { id: 'market_confidence', label: 'Market confidence' },
    ],
  },
  {
    id: 'sustainability_trends',
    label: 'Sustainability Trends',
    subOptions: [
      { id: 'green_initiatives', label: 'Green initiatives' },
      { id: 'esg_trends', label: 'ESG trends' },
      { id: 'circular_economy', label: 'Circular economy' },
    ],
  },
  {
    id: 'global_market_dynamics',
    label: 'Global Market Dynamics',
    subOptions: [
      { id: 'geographic_trends', label: 'Geographic trends' },
      { id: 'trade_patterns', label: 'Trade patterns' },
      { id: 'emerging_markets', label: 'Emerging markets' },
    ],
  },
  {
    id: 'innovation_trends',
    label: 'Innovation Trends',
    subOptions: [
      { id: 'rd_investments', label: 'R&D investments' },
      { id: 'product_innovation', label: 'Product innovation' },
      { id: 'disruptive_innovations', label: 'Disruptive innovations' },
    ],
  },
  {
    id: 'customer_expectations',
    label: 'Customer Expectations',
    subOptions: [
      { id: 'service_expectations', label: 'Service expectations' },
      { id: 'personalization_demands', label: 'Personalization demands' },
      { id: 'omnichannel_preferences', label: 'Omnichannel preferences' },
    ],
  },
];

export const PRODUCT_LAUNCH_DATA_POINTS: DataPoint[] = [
  {
    id: 'market_analysis',
    label: 'Market Analysis',
    subOptions: [
      { id: 'target_market_size', label: 'Target market size' },
      { id: 'market_segments', label: 'Market segments' },
      { id: 'market_readiness', label: 'Market readiness' },
    ],
  },
  {
    id: 'competitive_analysis',
    label: 'Competitive Analysis',
    subOptions: [
      { id: 'competitor_products', label: 'Competitor products' },
      { id: 'competitive_advantages', label: 'Competitive advantages' },
      { id: 'market_gaps', label: 'Market gaps' },
    ],
  },
  {
    id: 'target_audience',
    label: 'Target Audience',
    subOptions: [
      { id: 'buyer_personas', label: 'Buyer personas' },
      { id: 'customer_pain_points', label: 'Customer pain points' },
      { id: 'audience_demographics', label: 'Audience demographics' },
    ],
  },
  {
    id: 'pricing_strategy',
    label: 'Pricing Strategy',
    subOptions: [
      { id: 'pricing_models', label: 'Pricing models' },
      { id: 'competitive_pricing', label: 'Competitive pricing' },
      { id: 'value_proposition', label: 'Value proposition' },
    ],
  },
  {
    id: 'marketing_strategy',
    label: 'Marketing Strategy',
    subOptions: [
      { id: 'marketing_channels', label: 'Marketing channels' },
      { id: 'campaign_timeline', label: 'Campaign timeline' },
      { id: 'content_strategy', label: 'Content strategy' },
      { id: 'budget_allocation', label: 'Budget allocation' },
    ],
  },
  {
    id: 'go_to_market',
    label: 'Go-to-Market Plan',
    subOptions: [
      { id: 'launch_timeline', label: 'Launch timeline' },
      { id: 'distribution_channels', label: 'Distribution channels' },
      { id: 'sales_strategy', label: 'Sales strategy' },
    ],
  },
  {
    id: 'product_positioning',
    label: 'Product Positioning',
    subOptions: [
      { id: 'unique_selling_points', label: 'Unique selling points' },
      { id: 'brand_messaging', label: 'Brand messaging' },
      { id: 'positioning_statement', label: 'Positioning statement' },
    ],
  },
  {
    id: 'pre_launch_activities',
    label: 'Pre-Launch Activities',
    subOptions: [
      { id: 'beta_testing', label: 'Beta testing' },
      { id: 'influencer_outreach', label: 'Influencer outreach' },
      { id: 'pr_strategy', label: 'PR strategy' },
    ],
  },
  {
    id: 'launch_metrics',
    label: 'Launch Metrics',
    subOptions: [
      { id: 'success_kpis', label: 'Success KPIs' },
      { id: 'tracking_mechanisms', label: 'Tracking mechanisms' },
      { id: 'performance_benchmarks', label: 'Performance benchmarks' },
    ],
  },
  {
    id: 'risk_mitigation',
    label: 'Risk Mitigation',
    subOptions: [
      { id: 'potential_risks', label: 'Potential risks' },
      { id: 'contingency_plans', label: 'Contingency plans' },
      { id: 'crisis_management', label: 'Crisis management' },
    ],
  },
  {
    id: 'post_launch',
    label: 'Post-Launch Strategy',
    subOptions: [
      { id: 'customer_feedback', label: 'Customer feedback collection' },
      { id: 'iteration_plan', label: 'Iteration plan' },
      { id: 'scale_strategy', label: 'Scale strategy' },
    ],
  },
];

export const DATA_POINTS_MAP: Record<string, DataPoint[]> = {
  competitor_analysis: COMPETITOR_ANALYSIS_DATA_POINTS,
  business_performance: BUSINESS_PERFORMANCE_DATA_POINTS,
  new_partners: NEW_PARTNERS_DATA_POINTS,
  market_trends: MARKET_TRENDS_DATA_POINTS,
  product_launch: PRODUCT_LAUNCH_DATA_POINTS,
};
