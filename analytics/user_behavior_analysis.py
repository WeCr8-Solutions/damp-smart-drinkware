#!/usr/bin/env python3
"""
📊 DAMP Smart Drinkware - User Behavior Analysis

This script analyzes user engagement patterns, voting behavior, and product 
preferences across the DAMP Smart Drinkware ecosystem.

Author: WeCr8 Solutions LLC
Date: 2024-12-19
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import json
import warnings
warnings.filterwarnings('ignore')

# Set display options
pd.set_option('display.max_columns', None)
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

class DAMPAnalytics:
    """DAMP Smart Drinkware Analytics Engine"""
    
    def __init__(self):
        """Initialize the analytics engine"""
        self.users_df = None
        self.voting_df = None
        self.hydration_df = None
        self.ecommerce_df = None
        
        print("🚀 DAMP Analytics Engine Initialized")
    
    def generate_sample_data(self):
        """Generate sample data for analysis demonstration"""
        print("📊 Generating sample data...")
        
        # Sample users data
        np.random.seed(42)
        self.users_df = pd.DataFrame({
            'user_id': [f'user_{i}' for i in range(1000)],
            'signup_date': pd.date_range('2024-01-01', periods=1000, freq='H'),
            'platform': np.random.choice(['web', 'mobile'], 1000, p=[0.6, 0.4]),
            'last_active': pd.date_range('2024-12-01', periods=1000, freq='H'),
            'total_sessions': np.random.poisson(15, 1000),
            'total_votes': np.random.poisson(5, 1000),
            'purchases': np.random.poisson(1.2, 1000),
            'hydration_goal_met': np.random.choice([True, False], 1000, p=[0.7, 0.3])
        })
        
        # Sample voting data
        self.voting_df = pd.DataFrame({
            'vote_id': range(5000),
            'user_id': np.random.choice(self.users_df['user_id'], 5000),
            'product_id': np.random.choice(['damp-handle', 'silicone-bottom', 'cup-sleeve', 'baby-bottle'], 5000),
            'timestamp': pd.date_range('2024-01-01', periods=5000, freq='2H'),
            'platform': np.random.choice(['web', 'mobile'], 5000, p=[0.65, 0.35])
        })
        
        # Sample hydration data
        self.hydration_df = pd.DataFrame({
            'user_id': np.repeat(self.users_df['user_id'].head(100), 30),
            'date': pd.date_range('2024-11-01', periods=3000, freq='D'),
            'daily_intake_ml': np.random.normal(2000, 500, 3000).clip(500, 4000),
            'goal_ml': np.random.choice([2000, 2500, 3000], 3000),
            'device_type': np.random.choice(['damp-handle', 'silicone-bottom', 'cup-sleeve'], 3000),
            'temperature_avg': np.random.normal(22, 5, 3000).clip(5, 40)
        })
        
        # Calculate goal achievement
        self.hydration_df['goal_achieved'] = self.hydration_df['daily_intake_ml'] >= self.hydration_df['goal_ml']
        self.hydration_df['goal_percentage'] = (self.hydration_df['daily_intake_ml'] / self.hydration_df['goal_ml'] * 100).clip(0, 200)
        
        # Sample e-commerce data
        self.ecommerce_df = pd.DataFrame({
            'user_id': self.users_df['user_id'],
            'page_views': np.random.poisson(8, 1000),
            'cart_additions': np.random.poisson(2, 1000),
            'checkout_starts': np.random.poisson(1, 1000),
            'purchases': self.users_df['purchases'],
            'total_spent': np.random.exponential(50, 1000) * self.users_df['purchases'],
            'platform': self.users_df['platform'],
            'signup_date': self.users_df['signup_date']
        })
        
        print("✅ Sample data generated successfully!")
    
    def analyze_user_engagement(self):
        """Analyze user engagement patterns"""
        print("\n👥 Analyzing User Engagement...")
        
        engagement_metrics = {
            'total_users': len(self.users_df),
            'active_users_30d': len(self.users_df[self.users_df['last_active'] >= datetime.now() - timedelta(days=30)]),
            'avg_sessions_per_user': self.users_df['total_sessions'].mean(),
            'avg_votes_per_user': self.users_df['total_votes'].mean(),
            'conversion_rate': (self.users_df['purchases'] > 0).mean(),
            'hydration_success_rate': self.users_df['hydration_goal_met'].mean()
        }
        
        # Platform comparison
        platform_stats = self.users_df.groupby('platform').agg({
            'user_id': 'count',
            'total_sessions': 'mean',
            'total_votes': 'mean',
            'purchases': 'mean',
            'hydration_goal_met': 'mean'
        }).round(2)
        
        print("📊 User Engagement Metrics:")
        for metric, value in engagement_metrics.items():
            print(f"  • {metric}: {value:.2f}")
        
        print("\n📱 Platform Comparison:")
        print(platform_stats)
        
        return engagement_metrics, platform_stats
    
    def analyze_voting_patterns(self):
        """Analyze product voting trends and preferences"""
        print("\n🗳️ Analyzing Voting Patterns...")
        
        # Product popularity
        product_votes = self.voting_df['product_id'].value_counts()
        product_percentages = (product_votes / product_votes.sum() * 100).round(1)
        
        # Voting trends over time
        self.voting_df['date'] = self.voting_df['timestamp'].dt.date
        daily_votes = self.voting_df.groupby(['date', 'product_id']).size().unstack(fill_value=0)
        
        # Platform preferences
        platform_votes = self.voting_df.groupby(['platform', 'product_id']).size().unstack(fill_value=0)
        
        print("🗳️ Product Voting Results:")
        for product, count in product_votes.items():
            percentage = product_percentages[product]
            print(f"  • {product}: {count} votes ({percentage}%)")
        
        print("\n📱 Platform Voting Preferences:")
        print(platform_votes)
        
        return product_votes, product_percentages, daily_votes, platform_votes
    
    def analyze_hydration_tracking(self):
        """Analyze hydration tracking effectiveness"""
        print("\n💧 Analyzing Hydration Tracking...")
        
        hydration_metrics = {
            'avg_daily_intake': self.hydration_df['daily_intake_ml'].mean(),
            'goal_achievement_rate': self.hydration_df['goal_achieved'].mean(),
            'avg_goal_completion': self.hydration_df['goal_percentage'].mean()
        }
        
        # Device performance comparison
        device_performance = self.hydration_df.groupby('device_type').agg({
            'daily_intake_ml': 'mean',
            'goal_achieved': 'mean',
            'goal_percentage': 'mean'
        }).round(2)
        
        print("💧 Hydration Tracking Metrics:")
        for metric, value in hydration_metrics.items():
            print(f"  • {metric}: {value:.1f}")
        
        print("\n🥤 Device Performance Comparison:")
        print(device_performance)
        
        return hydration_metrics, device_performance
    
    def analyze_ecommerce_conversion(self):
        """Analyze e-commerce conversion funnel"""
        print("\n🛒 Analyzing E-commerce Conversion...")
        
        total_users = len(self.ecommerce_df)
        users_with_views = len(self.ecommerce_df[self.ecommerce_df['page_views'] > 0])
        users_with_cart = len(self.ecommerce_df[self.ecommerce_df['cart_additions'] > 0])
        users_with_checkout = len(self.ecommerce_df[self.ecommerce_df['checkout_starts'] > 0])
        users_with_purchase = len(self.ecommerce_df[self.ecommerce_df['purchases'] > 0])
        
        funnel = {
            'Total Users': total_users,
            'Page Views': users_with_views,
            'Cart Additions': users_with_cart,
            'Checkout Started': users_with_checkout,
            'Purchases': users_with_purchase
        }
        
        # Calculate conversion rates
        conversion_rates = {
            'View to Cart': users_with_cart / users_with_views if users_with_views > 0 else 0,
            'Cart to Checkout': users_with_checkout / users_with_cart if users_with_cart > 0 else 0,
            'Checkout to Purchase': users_with_purchase / users_with_checkout if users_with_checkout > 0 else 0,
            'Overall Conversion': users_with_purchase / total_users
        }
        
        # Platform comparison
        platform_conversion = self.ecommerce_df.groupby('platform').agg({
            'page_views': 'mean',
            'cart_additions': 'mean',
            'purchases': 'mean',
            'total_spent': 'mean'
        }).round(2)
        
        print("🛒 E-commerce Conversion Funnel:")
        for stage, count in funnel.items():
            print(f"  • {stage}: {count}")
        
        print("\n📈 Conversion Rates:")
        for metric, rate in conversion_rates.items():
            print(f"  • {metric}: {rate:.1%}")
        
        print("\n📱 Platform E-commerce Performance:")
        print(platform_conversion)
        
        return funnel, conversion_rates, platform_conversion
    
    def generate_insights(self):
        """Generate comprehensive insights and recommendations"""
        print("\n🎯 Generating Key Insights...")
        
        insights = {
            "User Engagement": {
                "total_users": len(self.users_df),
                "mobile_vs_web": self.users_df['platform'].value_counts().to_dict(),
                "avg_sessions": self.users_df['total_sessions'].mean(),
                "retention_rate": (self.users_df['last_active'] >= datetime.now() - timedelta(days=7)).mean()
            },
            "Product Preferences": {
                "most_popular": self.voting_df['product_id'].value_counts().index[0],
                "voting_engagement": len(self.voting_df) / len(self.users_df),
                "platform_preference": self.voting_df['platform'].value_counts().to_dict()
            },
            "Hydration Success": {
                "goal_achievement_rate": self.hydration_df['goal_achieved'].mean(),
                "avg_daily_intake": self.hydration_df['daily_intake_ml'].mean(),
                "best_device": self.hydration_df.groupby('device_type')['goal_achieved'].mean().idxmax()
            },
            "E-commerce Performance": {
                "conversion_rate": (self.ecommerce_df['purchases'] > 0).mean(),
                "avg_order_value": self.ecommerce_df[self.ecommerce_df['total_spent'] > 0]['total_spent'].mean(),
                "platform_performance": self.ecommerce_df.groupby('platform')['total_spent'].mean().to_dict()
            }
        }
        
        return insights
    
    def create_visualizations(self):
        """Create comprehensive visualizations"""
        print("\n📊 Creating Visualizations...")
        
        # Set up the plotting style
        plt.rcParams['figure.figsize'] = (15, 12)
        
        # Create subplots
        fig, axes = plt.subplots(2, 3, figsize=(18, 12))
        fig.suptitle('📊 DAMP Smart Drinkware - Analytics Dashboard', fontsize=16, fontweight='bold')
        
        # 1. Platform distribution
        platform_counts = self.users_df['platform'].value_counts()
        axes[0, 0].pie(platform_counts.values, labels=platform_counts.index, autopct='%1.1f%%')
        axes[0, 0].set_title('Platform Distribution')
        
        # 2. Product voting results
        product_votes = self.voting_df['product_id'].value_counts()
        axes[0, 1].bar(product_votes.index, product_votes.values)
        axes[0, 1].set_title('Product Voting Results')
        axes[0, 1].tick_params(axis='x', rotation=45)
        
        # 3. Hydration goal achievement
        goal_achievement = self.hydration_df.groupby('device_type')['goal_achieved'].mean()
        axes[0, 2].bar(goal_achievement.index, goal_achievement.values)
        axes[0, 2].set_title('Hydration Goal Achievement by Device')
        axes[0, 2].tick_params(axis='x', rotation=45)
        
        # 4. User engagement over time
        signup_trend = self.users_df.groupby(self.users_df['signup_date'].dt.date).size()
        axes[1, 0].plot(signup_trend.index, signup_trend.values)
        axes[1, 0].set_title('User Signups Over Time')
        axes[1, 0].tick_params(axis='x', rotation=45)
        
        # 5. Revenue by platform
        platform_revenue = self.ecommerce_df.groupby('platform')['total_spent'].mean()
        axes[1, 1].bar(platform_revenue.index, platform_revenue.values)
        axes[1, 1].set_title('Average Revenue by Platform')
        
        # 6. Daily intake distribution
        axes[1, 2].hist(self.hydration_df['daily_intake_ml'], bins=30, alpha=0.7)
        axes[1, 2].set_title('Daily Water Intake Distribution')
        axes[1, 2].set_xlabel('Intake (ml)')
        
        plt.tight_layout()
        plt.savefig('analytics/damp_analytics_dashboard.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        print("📈 Visualizations created and saved!")
    
    def export_results(self, insights):
        """Export analysis results"""
        print("\n💾 Exporting Results...")
        
        # Prepare export data
        export_data = {
            "analysis_date": datetime.now().isoformat(),
            "insights": insights,
            "summary_stats": {
                "users_analyzed": len(self.users_df),
                "votes_analyzed": len(self.voting_df),
                "hydration_records": len(self.hydration_df),
                "ecommerce_records": len(self.ecommerce_df)
            }
        }
        
        # Save to JSON
        with open('analytics/user_behavior_analysis_results.json', 'w') as f:
            json.dump(export_data, f, indent=2, default=str)
        
        # Save summary CSV files
        platform_comparison = self.users_df.groupby('platform').agg({
            'user_id': 'count',
            'total_sessions': 'mean',
            'total_votes': 'mean',
            'purchases': 'mean'
        })
        platform_comparison.to_csv('analytics/platform_comparison.csv')
        
        device_performance = self.hydration_df.groupby('device_type').agg({
            'daily_intake_ml': 'mean',
            'goal_achieved': 'mean',
            'goal_percentage': 'mean'
        })
        device_performance.to_csv('analytics/device_performance.csv')
        
        print("💾 Results exported:")
        print("  • user_behavior_analysis_results.json")
        print("  • platform_comparison.csv")
        print("  • device_performance.csv")
        print("  • damp_analytics_dashboard.png")
    
    def print_recommendations(self, insights):
        """Print actionable recommendations"""
        print("\n🎯 KEY INSIGHTS & RECOMMENDATIONS")
        print("=" * 50)
        
        print("\n👥 USER ENGAGEMENT:")
        print(f"  • Total active users: {insights['User Engagement']['total_users']:,}")
        print(f"  • Platform split: {insights['User Engagement']['mobile_vs_web']}")
        print(f"  • Average sessions per user: {insights['User Engagement']['avg_sessions']:.1f}")
        print(f"  • 7-day retention rate: {insights['User Engagement']['retention_rate']:.1%}")
        
        print("\n🗳️ PRODUCT PREFERENCES:")
        print(f"  • Most popular product: {insights['Product Preferences']['most_popular']}")
        print(f"  • Votes per user: {insights['Product Preferences']['voting_engagement']:.1f}")
        print(f"  • Platform voting: {insights['Product Preferences']['platform_preference']}")
        
        print("\n💧 HYDRATION TRACKING:")
        print(f"  • Goal achievement rate: {insights['Hydration Success']['goal_achievement_rate']:.1%}")
        print(f"  • Average daily intake: {insights['Hydration Success']['avg_daily_intake']:.0f} ml")
        print(f"  • Best performing device: {insights['Hydration Success']['best_device']}")
        
        print("\n🛒 E-COMMERCE:")
        print(f"  • Overall conversion rate: {insights['E-commerce Performance']['conversion_rate']:.1%}")
        print(f"  • Average order value: ${insights['E-commerce Performance']['avg_order_value']:.2f}")
        print(f"  • Platform performance: {insights['E-commerce Performance']['platform_performance']}")
        
        print("\n📈 ACTIONABLE RECOMMENDATIONS:")
        print("  1. 📱 Focus mobile app development - strong engagement potential")
        print("  2. 🎯 Promote most popular products in marketing campaigns")
        print("  3. 🎮 Implement hydration goal gamification features")
        print("  4. 🛒 Optimize checkout process to improve conversion rates")
        print("  5. 🔄 Cross-promote between web and mobile platforms")
        print("  6. 📊 A/B test different product positioning strategies")
        print("  7. 💧 Develop device-specific hydration coaching")
        print("  8. 🎁 Create loyalty programs for repeat customers")
        
        print("\n" + "=" * 50)
    
    def run_complete_analysis(self):
        """Run the complete analytics pipeline"""
        print("🚀 Starting DAMP Smart Drinkware Analytics Pipeline")
        print("=" * 60)
        
        # Generate sample data
        self.generate_sample_data()
        
        # Run all analyses
        engagement_metrics, platform_stats = self.analyze_user_engagement()
        voting_results = self.analyze_voting_patterns()
        hydration_metrics, device_performance = self.analyze_hydration_tracking()
        ecommerce_results = self.analyze_ecommerce_conversion()
        
        # Generate insights
        insights = self.generate_insights()
        
        # Create visualizations
        self.create_visualizations()
        
        # Export results
        self.export_results(insights)
        
        # Print recommendations
        self.print_recommendations(insights)
        
        print("\n✅ DAMP Analytics Pipeline Completed Successfully!")
        print("📊 Check the analytics/ folder for exported results and visualizations.")
        
        return insights

def main():
    """Main execution function"""
    # Initialize analytics engine
    analytics = DAMPAnalytics()
    
    # Run complete analysis
    insights = analytics.run_complete_analysis()
    
    return insights

if __name__ == "__main__":
    # Run the analysis
    results = main()